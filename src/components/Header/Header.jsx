import React, { useState, useEffect, useRef } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import BorderBox from "../borderBox/BorderBox";
import "../Header/index.scss";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import { createWebSocketConnection } from "../../webSocket/webSocketUtil";
import { useSelectedStock } from "../../context";
import { symData, styles } from "../Header/data";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { apiConfig, ws } from "../../commonApi/apiConfig";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Grid,
  useTheme,
  useMediaQuery,
  Typography,
  Tooltip,
} from "@mui/material";
import { TreeItem, TreeView } from "@mui/x-tree-view";

const tickerNamesOrder = [
  "NIFTY 50",
  "SENSEX",
  "GIFTY NIFTY",
  "NIFTY IT",
  "NIFTY BANK",
  "NIFTY 100",
  "INDIA VIX",
  "NIFTY SMLCAP 250",
  "Nifty Midcap 150",

];
let stockDataDisplayMap = new Map();
let stockDisplayArr = [];
let selectedData = "";
let selectedSymbol = "";
let socketClient = null;

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [selectedIndicesValue, setSelectedIndicesValue] = useState();
  const [allIndices, setAllIndices] = useState([]);
  const [data, setData] = useState(stockDisplayArr);
  const [sector, setSector] = useState([]);
  const { setSelected, setStockName } = useSelectedStock();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  const [email, setEmail] = useState(() => Cookies.get("email") || "");
  const [impliedOpen, setImpliedOpen] = useState()
  const navigate = useNavigate();


  console.log('impliedOpen', impliedOpen)
  

  useEffect(() => {
    const tokenFromCookies = Cookies.get("token");
    if (tokenFromCookies) {
      setToken(tokenFromCookies);
      getStocksData();
      webSocket();
    } else {
      navigate("/");
    }
    return () => {
      if (socketClient) {
        socketClient.disconnect();
      }
    };
  }, []);


  /// implied open code///////////


  const getImpliedOpenData = async () => {


    try {
      const response = await apiConfig(
        `impliedopen`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    
     setImpliedOpen(response)

    } catch (error) {
      if (error?.code === "ERR_NETWORK" || token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        setEmail("");
        navigate("/");
      }
  
    }
  };


  useEffect(() => {

    getImpliedOpenData();
    const interval = setInterval(() => {
      getImpliedOpenData();
    }, 10000);
  
    return () => clearInterval(interval); // Cleanup function
  }, []);







  // const getStocksData = () => {
  //   apiConfig(
  //     `getStocksData?exchangeSymbols=NIFTY 50,SENSEX,NIFTY IT,NIFTY BANK,NIFTY 100,INDIA VIX`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     }
  //   )
  //     .then((response) => {
  //       stockDisplayArr = response;
  //       setData(response);

  //       response?.data?.forEach((element, index) => {
  //         stockDataDisplayMap.set(element.exchangeSymbol, index);
  //       });
  //     })
  //     .catch((error) => {
  //       if (token === "") {
  //         Cookies.remove("token");
  //         Cookies.remove("email");
  //         setEmail("");
  //         navigate("/");
  //       }

  //       console.error(error,"error");
  //     });
  // };

  const getStocksData = async () => {
    try {
      const response = await apiConfig(
        `getStocksData?exchangeSymbols=NIFTY 50,SENSEX,NIFTY IT,NIFTY BANK,NIFTY 100,INDIA VIX,NIFTY SMLCAP 250,Nifty Midcap 150`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      stockDisplayArr = response;
      setData(response);
      response?.data?.forEach((element, index) => {
        stockDataDisplayMap.set(element.exchangeSymbol, index);
      });
    } catch (error) {
      if (error?.code === "ERR_NETWORK" || token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        setEmail("");
        navigate("/");
      }
      console.error(error);
    }
  };

  const webSocket = () => {
    function onConnect() {
      socketClient.subscribe(ws.exchangeHeaderUrl, function (d) {
        var str = d.body;
        var stock = JSON.parse(str);

       
        if (stockDisplayArr?.length >= 0) {
          setData((prevData) => {
            return prevData.map((item) => {
              if (item?.exchangeSymbol === stock?.exchangeSymbol) {
                return {
                  ...item,
                  lastPrice: stock?.lastPrice,
                  change: (stock?.lastPrice - item.prevClose)?.toFixed(2),
                  percentChange: (
                    ((stock?.lastPrice - item.prevClose) / item.prevClose) *
                    100
                  )?.toFixed(2),
                };
              }
              return item;
            });
          });
        }
      });
    }

    function onError(e) {
      console.log("STOMP ERROR", e);
      setTimeout(webSocket, 1000);
    }

    socketClient = createWebSocketConnection(ws.socketUrl, onConnect, onError);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleExchangeSelection = async (event, key, value) => {
    console.log("handleExchangeSelection", key, value);
    selectedData = value;
    selectedSymbol = key;
    setSelectedValue(selectedSymbol);
    setSelectedIndicesValue(selectedSymbol);
    if (selectedSymbol === "FNO") {
      return;
    } else {
      selectedSymbol === "NSE" || selectedSymbol === "BSE"
        ? getSectors()
        : selectedSymbol === "All INDICES"
          ? allStockIndices("All INDICES")
          : getExchangeStock();
    }
  };

  const getSectors = async () => {
    try {
      const response = await apiConfig(`getSectors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSector(response);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        setEmail("");
        navigate("/");
      }
      console.error(error);
    }
  };

  const getExchangeStock = async () => {
    try {
      const response = await apiConfig(
        `getAllIndices?exchangeId=${selectedData}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAllIndices(response);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        setEmail("");
        navigate("/");
      }
      console.error(error);
    }
  };

  const allStockIndices = async (name) => {
    closeSidebar();
    setSelectedValue("");
    try {
      const response = await apiConfig(
        `allStocks?exchangeId=${selectedData}&instrumentId=${"1"}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelected(response);
      setStockName(name);
      setAllIndices("");
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        setEmail("");
        navigate("/");
      }
      console.error(error);
    }
  };






  const intervalRef = useRef(null);

  const getStocks = async (value, name) => {
    if (selectedSymbol === "NSE" || selectedSymbol === "BSE") {
      await getSectorStocks(value, name);
      startSectorStocksInterval(value, name); // Start interval for sector stocks
    } else {
      await getSector(value, name);
      startSectorInterval(value, name); // Start interval for sector
    }
  };

  const getSectorStocks = async (value, name) => {
    closeSidebar();
    try {
      const response = await apiConfig(
        `getSectorStocks?sectorId=${value}&exchangeId=${selectedData}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelected(response);
      setStockName(name);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        setEmail("");
        navigate("/");
      }
      console.error(error);
    }
  };

  // Function to start the interval
  const startSectorStocksInterval = (sectorId, sectorName) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Clear existing interval
    }
    intervalRef.current = setInterval(() => {
      getSectorStocks(sectorId, sectorName);
    }, 1000); // 3000 milliseconds = 3 seconds
  };
  const startSectorInterval = (sectorId, sectorName) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Clear existing interval
    }
    intervalRef.current = setInterval(() => {
      getSector(sectorId, sectorName);
    }, 1000); // 3000 milliseconds = 3 seconds
  };

  // Cleanup interval on component unmount or when selectedSymbol changes
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);









  const getSector = async (value, name) => {
    closeSidebar();
    const sanitizedValue = value?.replace(/&/g, "%26");
    try {
      const response = await apiConfig(
        `getIndicesStock?indicesName=${sanitizedValue}&exchangeId=${selectedData}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelected(response);
      setStockName(name);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        setEmail("");
        navigate("/");
      }
      console.error(error);
    }
  };


  const renderTree = (node) => {
    console.log("node", node)

    const handleClick = (event, id, name) => {
      if (id && event.target.tagName === "DIV") {
        getStocks(id, name);
      } else if (id && event.target.tagName === "DIV") {
        getStocks(id, name);
      }
    };

    return (
      <TreeItem
        key={node.id}
        nodeId={node.id}
        label={node.name}
        onClick={(e) => handleClick(e, node.id, node.name)}
      >
        {Array.isArray(node.sectorMasterList) &&
          node.sectorMasterList.length > 0
          ? node.sectorMasterList.map((sector) => renderTree(sector))
          : Array.isArray(node.industryList) && node.industryList.length > 0
            ? node.industryList.map((industry) => renderTree(industry))
            : Array.isArray(node.basicIndustryList) &&
              node.basicIndustryList.length > 0
              ? node.basicIndustryList.map((basicIndustry) => (
                <TreeItem
                  key={basicIndustry.id}
                  nodeId={basicIndustry.id}
                  label={basicIndustry.name}
                  onClick={(e) =>
                    handleClick(e, basicIndustry.id, basicIndustry.name)
                  }
                />
              ))
              : null}
      </TreeItem>
    );
  };

  function openInNewTab(url) {
    const newTab = window.open(url, "_blank");
    if (newTab) {
      newTab.focus();
    }
  }

  const cards = tickerNamesOrder.map((tickerName) => {
    console.log("tickerName", tickerName);
  
    if (tickerName === "GIFTY NIFTY") {
      return (
        <div
          key={`gifty-nifty-card`}
       
        >
          <BorderBox className="cardBox">
            <div className="marketDetails">
              <Typography
                className="indicesName"
                style={{ fontSize: `${isMobile ? "14px" : ""}` }}
              >
                {"Gifty Nifty" || "-"}
              </Typography>
  
              <Typography
                className={`currentValue`}
                style={{ fontSize: `${isMobile ? "14px" : ""}` }}
              >
                {
                  typeof impliedOpen?.gift_nifty_value === "number"
                    ? impliedOpen?.gift_nifty_value?.toFixed(2)
                    : impliedOpen?.gift_nifty_value || "-"
                }
              </Typography>
            </div>
  
            <div className="marketValue">
              <Typography
                className={
                  impliedOpen && impliedOpen?.implied_change > 0
                    ? "percentGreen"
                    : impliedOpen && impliedOpen?.implied_change == 0
                      ? "percentBlue"
                      : "percentRed"
                }
                style={{
                  backgroundColor: `${isMobile
                    ? `${impliedOpen && impliedOpen?.implied_change < 0
                      ? "#F7E5DF"
                      : impliedOpen && impliedOpen?.implied_change == 0
                        ? "#d4ebf2"
                        : "#E6F4EA"
                    }`
                    : ""
                  }`,
                  borderRadius: `${isMobile ? "10px" : ""}`,
                  padding: `${isMobile ? "0px 5px" : ""}`,
                  fontSize: `${isMobile ? "14px" : ""}`,
                }}
              >
                {"Implied" || "-"}
              </Typography>
  
              <Typography
                className={
                  impliedOpen && impliedOpen?.implied_change > 0
                    ? "valueGreen"
                    : impliedOpen && impliedOpen?.implied_change == 0
                      ? "valueBlue"
                      : "valueRed"
                }
              >
                {
                  typeof impliedOpen?.implied_change === "number"
                    ? impliedOpen?.implied_change?.toFixed(2)
                    : impliedOpen?.implied_change || "-"
                }
              </Typography>
            </div>
          </BorderBox>
        </div>
      );
    } else {
      const item = data.find((item) => item.exchangeSymbol === tickerName);
      
      if (item) {
        return (
          <div
            key={item.id}
            onClick={(event) => {
              event.stopPropagation();
              openInNewTab(`/${item.exchangeSymbol}/${item.exchangeId}/${item.lastPrice}/${item.prevClose}`);
            }}
          >
            <BorderBox className="cardBox">
              <div className="marketDetails">
                <Typography
                  className="indicesName"
                  style={{ fontSize: `${isMobile ? "14px" : ""}` }}
                >
                  {item?.name || "-"}
                </Typography>
  
                <Typography
                  className={`currentValue`}
                  style={{ fontSize: `${isMobile ? "14px" : ""}` }}
                >
                  {
                    typeof item?.lastPrice === "number"
                      ? item?.lastPrice?.toFixed(2)
                      : item?.lastPrice || "-"
                  }
                </Typography>
              </div>
  
              <div className="marketValue">
                <Typography
                  className={
                    item && item.change > 0
                      ? "percentGreen"
                      : item.change == 0
                        ? "percentBlue"
                        : "percentRed"
                  }
                  style={{
                    backgroundColor: `${isMobile
                      ? `${item && item.change < 0
                        ? "#F7E5DF"
                        : item.change == 0
                          ? "#d4ebf2"
                          : "#E6F4EA"
                      }`
                      : ""
                    }`,
                    borderRadius: `${isMobile ? "10px" : ""}`,
                    padding: `${isMobile ? "0px 5px" : ""}`,
                    fontSize: `${isMobile ? "14px" : ""}`,
                  }}
                >
                  {
                    typeof item?.percentChange === "number"
                      ? `${item?.percentChange?.toFixed(2)}%`
                      : `${item?.percentChange}%` || "-"
                  }
                </Typography>
             
                <Typography
                  className={
                    item && item.change > 0
                      ? "valueGreen"
                      : item.change == 0
                        ? "valueBlue"
                        : "valueRed"
                  }
                >
                  {
                    typeof item?.change === "number"
                      ? item?.change.toFixed(2)
                      : item?.change || "-"
                  }
                </Typography>
              </div>
            </BorderBox>
          </div>
        );
      }
  
      return null;
    }
  });

  const handleImageClick = () => {
    window.location.reload();
  };

  return (
    <header className="header-container">
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="transparent">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              aria-label="menu"
              sx={{ mb: 0.5 }}
              style={{ color: "black" }}
              onClick={toggleSidebar}
            >
              <MenuIcon />
            </IconButton>
            <Tooltip title="Go to Home">
              <Link to="/interested">
                <img
                  src={"../../images/logo.png"}
                  alt="NDTVPROFIT"
                  style={{
                    objectFit: "contain",
                    width: "100px",
                    marginRight: "5px",
                  }}
                  onClick={handleImageClick}
                />
              </Link>
            </Tooltip>

            <div
              className="marketData"
              variant="h6"
              component="div"
              sx={{ flexGrow: 1 }}
            >
              {cards}
            </div>
          </Toolbar>
        </AppBar>
      </Box>
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <nav>
          <IconButton
            className="close-button"
            size="large"
            edge="start"
            aria-label="close"
            sx={{ ml: 2 }}
            onClick={closeSidebar}
          >
            <CloseIcon />
          </IconButton>

          <Grid item xs={12} sm={6} md={2}>
           
            {symData.map((dataObj, index) => (
         
             
             <div key={index}>

                {Object.entries(dataObj).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: "10px" }}>
                    
                    <Link
                      onClick={(event) =>
                        handleExchangeSelection(event, key, value)
                      }
                      // to={key === "FNO" && "/fno"}
                      style={{
                        textDecoration: "none",
                        color: selectedValue === key ? "#FF5722" : "#2196F3",
                        cursor: "pointer",
                        fontSize: "18px",
                        fontWeight: selectedValue === key ? "bolder" : "bolder",
                        marginLeft: "30px ",
                      }}
                    >
                      {`${key}`}
                    </Link>
                  </div>
                ))}
              </div>

            ))}
          </Grid>

          {selectedIndicesValue === "NSE" || selectedIndicesValue === "BSE" ? (
            <div className="treeview-container">
              <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                className="custom-treeview"
              >
                {sector && sector?.map((sector) => renderTree(sector))}
              </TreeView>
            </div>
          ) : (
            <div className="scrollable-list" style={styles.scrollable}>
              <Link to="/interested" className="sidebar-link">
                <ul style={{ margin: "20px 0" }}>
                 
                  {allIndices
                    ? allIndices?.map((item, index) => (
                     
                    
                    <React.Fragment key={index}>
                        <li
                          className="sidebar-list-item"
                          onMouseEnter={(e) => {
                            e.target.classList.add("hovered");
                          }}
                          onMouseLeave={(e) => {
                            e.target.classList.remove("hovered");
                          }}
                          onClick={() => getStocks(item, item)}
                        >
                          <strong style={{ marginRight: "8px" }}>•</strong>
                          <span
                            style={{
                              flex: 1,
                              fontSize: "16px",
                              fontFamily:
                                'Calibri, Candara, Segoe, "Segoe UI",  Optima, Arial, sans-serif',
                            }}
                          >
                            {item}
                          </span>
                        </li>
                        {index < allIndices.length - 1 && (
                          <hr style={styles.separator} />
                        )}
                      </React.Fragment>
                    ))
                    : ""}

                    
                </ul>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
