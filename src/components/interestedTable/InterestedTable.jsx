import React, { useEffect, useState, useRef } from "react";
import { createWebSocketConnection } from "../../webSocket/webSocketUtil";
import { CustomTable, SnackbarPopup } from "../../common/common";
import Cookies from "js-cookie";
import { apiConfig, apiConfigPostChange, ws } from "../../commonApi/apiConfig";
import { useNavigate } from "react-router";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from '@mui/x-data-grid';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,TableFooter,TableSortLabel ,Paper,
} from "@mui/material";
import {
  ChangePasswordPopup,
  CommonTabs,
  StockDetailsDialog,
} from "../../common/common";
import {
  Grid,
  Typography,
  TextField,
  Autocomplete,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  useMediaQuery,
  useTheme,
  Box,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSelectedStock } from "../../context";
import { indices, tabs } from "./data";
import "./interested.scss";
 import { Link } from "react-router-dom";
import Chart from "react-apexcharts";
import { AlertsNews } from "../Alert/alert";
import CustomDialog from "./customDialog";
import Avatar from '@mui/material/Avatar';


//Akshay
const header = [
  { label: "name" },
  { label: "lastPrice" },
  { label: "prevClose" },
  { label: "change" },
  { label: "percentChange" },
  { label: "Fall_From_High(%)" },
  { label: "Fall_From_High" },
  { label: "Gain_From_Low(%)" },
  { label: "Gain_From_Low" },
  { label: "indicative_close" },
  { label: "accVolume" },
  { label: "Turnover (Rs Cr)" },
  { label: "dayOpen" },
  { label: "Open(%)" },
  { label: "dayHigh" },
  { label: "High(%)" },
  { label: "dayLow" },
  { label: "Low(%)" },
  { label: "avg30Volume" },
  { label: "marketCap(Cr)" },
  { label: "chngMktCap(Cr)" },
 
  { label: "high52Week" },

  { label: "Fall From high52Week" },

  { label: "low52Week" },

  { label: "Gain From low52Week" }
  
];

let seriesData;
let categories;
let minimum;
let maximum;
let source;

let stockDataDisplayMap = new Map();
let stockDisplayArr = [];
let socketClient = null;
let headerTitle = "";
let handleAddStock;
let userwatchListId = [];


const InterestedTable = () => {
  const [data, setData] = useState();
  const [searchInput, setSearchInput] = useState("");
  const [dataFullArr, setDataFullArr] = useState([]);
  const [filters, setFilters] = useState([]);
  const [indicesStock, setIndicesStock] = useState([]);
  const [selectedExchange, setSelectedExchange] = useState("NSE");
  const [popupTimer, setPopupTimer] = useState(null);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [responseStatus, setResponseStatus] = useState({});
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState(() => Cookies.get("email") || "");
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [severity, setSeverity] = useState("");
  const [userInputs, setUserInputs] = useState([]);
  const [valueTab, setValueTab] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDialogNewOpen, setDialogNewOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("All INDICES");
  const { selectedStock, stockName, setStockName } = useSelectedStock();
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showPieChart, setShowPieChart] = useState(false);
  const [open, setOpen] = useState(false);
  const intervalRef = useRef(null); //new
  const prevStockNameRef = useRef(stockName); //new
  const [popupData, setPopupData] = useState([]);
  const [opened, setOpened] = useState(false); // New state for Popup data
  const emailInitials = email.slice(0,1).toUpperCase()




  

  const onMenuChange = (event, newValue) => {
    setValueTab(newValue);
    setData([]);
    stockDisplayArr = [];
    stockDataDisplayMap = new Map();

    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Stop the interval when menu changes
      intervalRef.current = null; // Clear the interval reference
    }

    if (newValue >= 0) {
      userwatchListId = userInputs
        .map((userId, index) => {
          if (newValue === index) {
            return userId.id;
          } else {
            return null;
          }
        })
        .filter((userId) => userId !== null);
      getWatchlistStocks(userwatchListId[0]);
    }
  }; //new

  const handleDeleteClick = async (e, index) => {
    e.stopPropagation();
    const isConfirmed = window.confirm("Are you sure you want to delete?");
    if (isConfirmed) {
      try {
        const response = await apiConfig(
          `deleteWatchlist?watchlistId=${userwatchListId[0]}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSnackBarOpen(true);
        setSeverity("info");
        setResponseStatus({ message: "Watchlist deleted successfully" });
        setValueTab(false);
        stockDataDisplayMap.clear();
        getWatchlist();
        setUserInputs([]);
        getIndices();
        setStockName("All INDICES");
      } catch (error) {
        if (token === "") {
          Cookies.remove("token");
          Cookies.remove("email");
          setEmail("");
          navigate("/");
        }
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const reloadPage = () => {
      window.location.reload();
    };

    const calculateTimeUntilMarketStartTime = () => {
      const now = new Date();
      const marketStartTime = new Date(now);
      marketStartTime.setHours(8, 59, 0, 0);

      const timeUntilMarketStart = marketStartTime - now;

      if (timeUntilMarketStart > 0) {
        setTimeout(() => reloadPage(), timeUntilMarketStart);
      }
    };

    calculateTimeUntilMarketStartTime();

    return () => {};
  }, []);

  
  useEffect(() => {
    const tokenFromCookies = Cookies.get("token");
    const emailFromCookies = Cookies.get("email");

     const connectWebSocket = () => {
     webSocket();
      console.log("WebSocket connected");
    };

    const disconnectWebSocket = () => {
      if (socketClient) {
        socketClient.disconnect();
        console.log("WebSocket disconnected");
      }
    };

    const scheduleWebSocket = () => {
      const now = new Date();
      const currentTime = now.getTime();

      const connectTime = new Date(now);
      connectTime.setHours(9, 0, 0, 0);

      const disconnectTime = new Date(now);
      disconnectTime.setHours(15, 30, 0, 0);

      const timeToConnect = connectTime.getTime() - currentTime;
      const timeToDisconnect = disconnectTime.getTime() - currentTime;

      if (timeToConnect > 0) {
        setTimeout(connectWebSocket, timeToConnect);
      } else if (timeToDisconnect > 0) {
        connectWebSocket();
        setTimeout(disconnectWebSocket, timeToDisconnect);
      }

      setInterval(() => {
        connectWebSocket();
        setTimeout(disconnectWebSocket, 6.5 * 60 * 60 * 1000);
      }, 24 * 60 * 60 * 1000);
    };

    if (tokenFromCookies && emailFromCookies) {
      setToken(tokenFromCookies);
      setEmail(emailFromCookies);
      getIndices();
      getWatchlist();
      scheduleWebSocket();
    } else {
      navigate("/");
    }

    return () => disconnectWebSocket();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (selectedStock && selectedStock.length > 0) {
          setLoading(false);
          setPopupData(selectedStock); // Set data for Popup
          setOpened(true); // Open the Popup
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedStock]);

  const handleClosed = () => {
    setOpened(false); // Close the Popup
    window.location.reload(); // Refresh the page
  };
  

  const getIndices = async (exchange) => {
    const exchangeMappings = {
      NSE: { id: 1, name: "NSE" },
      BSE: { id: 2, name: "BSE" },
      INTL: { id: 100, name: "INTL" },
      default: { id: 0, name: "All INDICES" },
    };

    const { id, name } = exchangeMappings[exchange] || exchangeMappings.default;

    setStockName(name);
    setSelectedValue(exchange);

    try {
      const response = await apiConfig(
        `allStocks?exchangeId=${id}&instrumentId=${"1"}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);
      const stockArr = response || [];
      
      stockDisplayArr = stockArr;
      stockDataDisplayMap.clear();
      setData(stockArr);

      stockArr.forEach((element, index) => {
        stockDataDisplayMap.set(element.exchangeSymbol, index);
      });
    } catch (error) {
      if (error?.code === "ERR_NETWORK" || token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        setEmail("");
        navigate("/");
      }

      setData([]);
      stockDataDisplayMap.clear();
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    if (!opened) {
      // Check if stockName has changed before setting the interval
      if (prevStockNameRef.current !== stockName) {
        prevStockNameRef.current = stockName; // Update the ref with the new stockName
        intervalRef.current = setInterval(() => {
          getIndices(stockName);
         
        }, 4000);
      }
    } else {
      clearInterval(intervalRef.current); // Clear interval when dialog opens
    }

    return () => {
      clearInterval(intervalRef.current); // Cleanup on component unmount
    };
  }, [opened, stockName]); //new

  const webSocket = () => {
    function onConnect() {
      socketClient.subscribe(ws.exchangeTableUrl, function (d) {
      
        const str = d.body;
        const stock = JSON.parse(str);
   
       

        if (stockDisplayArr.length >= 0) {
          let arr = [...stockDisplayArr];

          if (arr != null && arr.length > 0) {
            let index = stockDataDisplayMap.get(stock.exchangeSymbol);

            if (arr[index]) {
              // if (stock.exchangeSymbol == "NIFTY 50") {
              //   console.log(str, "str");
              // }
              if(stock?.lastPrice &&stock.lastPrice>0)
              {
                arr[index].lastPrice = stock?.lastPrice;
                const change = stock?.lastPrice - arr[index].prevClose;
                const percentChange = (change / arr[index].prevClose) * 100;
                arr[index].change = change?.toFixed(2);
                arr[index].percentChange = percentChange?.toFixed(2);
                //  arr[index].accVolume = stock?.accVolume;
                arr[index].dayHigh = stock?.dayHigh;
                arr[index].dayLow = stock?.dayLow;
                arr[index].indiClose = stock?.indiClose;

                stockDisplayArr[index] = arr[index];
                let disparr = [...stockDisplayArr];
                if(disparr){
                  setLoading(false);
                }
               
                setData(disparr);
               
              }
            }
          }
        }
      });
    }

    function onError(e) {
      console.log("STOMP ERROR", e);
      setTimeout(webSocket, 1000);
    }
    socketClient = createWebSocketConnection(ws.socketUrl, onConnect, onError);
  };

  const getIndicesStock = async (name, id) => {
    const sanitizedValue = name?.replace(/&/g, "%26");

    try {
      const response = await apiConfig(
        `getIndicesStock?indicesName=${sanitizedValue}&exchangeId=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIndicesStock(response);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        setEmail("");
        navigate("/");
      }
      setIndicesStock([]);
      console.error(error);
    }
  };

  const getWatchlist = async () => {
    try {
      const response = await apiConfig(`getWatchlist?userId=${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      handleAddStock(response);
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

  const getWatchlistStocks = async (valueTab) => {
    setLoading(true);
    try {
      const response = await apiConfig(
        `getWatchlistStocks?watchlistId=${valueTab}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoading(false);
      const watchList = response?.map((resp) => {
        resp.flag = 1;
        return resp;
      });
      stockDisplayArr = watchList;
      setData(watchList);
      stockDataDisplayMap.clear();
      watchList?.forEach((element, index) => {
        stockDataDisplayMap.set(element.exchangeSymbol, index);
      });
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        setEmail("");
        navigate("/");
      }
      setData([]);
      stockDataDisplayMap.clear();
      setLoading(false);
      console.error(error);
    }
  };

  const getAllStocks = async (value) => {
    let exchangeId;
    value = value.trim();

    if (value.length >= 3) {
      if (selectedExchange === "NSE") {
        exchangeId = 1;
      } else if (selectedExchange === "INTL") {
        exchangeId = [3, 4, 5, 6];
      } else {
        exchangeId = 2;
      }
      try {
        const response = await apiConfig(
          `searchStocks?exchangeId=${exchangeId}&text=${value}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDataFullArr(response);
        setFilters(response);
      } catch (error) {
        if (token === "") {
          Cookies.remove("token");
          Cookies.remove("email");
          setEmail("");
          navigate("/");
        }
        setFilters([]);
        setDataFullArr([]);
        console.error(error);
      }
    }
  };

  const saveWatchList = async (id, stocks) => {
    setLoading(true);
    const payload = {
      watchlist: id,
      stocks: stocks,
    };

    try {
      const response = await apiConfigPostChange(
        `saveWatchlistStock`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoading(false);
      setSnackBarOpen(true);
      setSeverity("info");
      setResponseStatus({ message: `${stocks} successfully added` });
      const watchList = response?.map((resp) => {
        resp.flag = 1;
        return resp;
      });
      setData(watchList);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        setEmail("");
        navigate("/");
      }
      setLoading(false);
      setFilters([]);
      setData([]);
      stockDataDisplayMap.clear();
      console.error(error);
    }
  };

  const deleteWatchList = (id, exchangeSymbol) => {
    setLoading(true);
    const sanitizedValue = exchangeSymbol?.replace(/&/g, "%26");
    try {
      const response = apiConfig(
        `deleteWatchlistStocks?watchlistId=${id}&exchangeSymbol=${sanitizedValue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        setEmail("");
        navigate("/");
      }
      setLoading(false);
      console.error(error);
    }
  };

  const searchStock = (event) => {
    event.preventDefault();
    if (event.keyCode === 13) {
      const enteredText = event.target.value;

      const matchingStock = dataFullArr?.find(
        (stock) =>
          stock.name &&
          `${stock.name.toLowerCase()} | ${stock.exchangeSymbol.toLowerCase()}` ===
            enteredText.toLowerCase()
      );

      if (matchingStock) {
        const exchangeSymbol = matchingStock.exchangeSymbol;
        if (!stockDataDisplayMap?.has(exchangeSymbol)) {
          matchingStock.flag = 1;
          stockDisplayArr.unshift(matchingStock);
          stockDataDisplayMap.clear();
          stockDisplayArr.forEach((element, index) => {
            stockDataDisplayMap.set(element.exchangeSymbol, index);
          });
          const disparr = [...stockDisplayArr];
          setData(disparr);
          if (Number.isInteger(valueTab) && valueTab >= 0) {
            saveWatchList(userwatchListId[0], matchingStock?.exchangeSymbol);
          }
          setSearchInput("");
        } else {
          setSearchInput("");
          setSnackBarOpen(true);
          setSeverity("info");
          setResponseStatus({ message: "This stock is already in the table." });
        }
      } else {
        setSnackBarOpen(true);
        setSeverity("warning");
        setResponseStatus({
          message: "Please select a valid stock from the list.",
        });
      }
    } else {
      const enteredText = event.target.value;
      getAllStocks(enteredText);
      const desiredList = dataFullArr?.filter((stock) => {
        return stock.name != null
          ? (stock.exchangeSymbol
              .toLowerCase()
              .includes(event.target.value.toLowerCase()) ||
              stock.name
                .toLowerCase()
                .includes(event.target.value.toLowerCase())) &&
              (stock.exchangeId === 1 ||
                stock.exchangeId === 2 ||
                stock.exchangeId === 3 ||
                stock.exchangeId === 4 ||
                stock.exchangeId === 5 ||
                stock.exchangeId === 6)
          : "";
      });

      setFilters(desiredList);
    }
  };

  const deleteRow = (exchangeSymbol) => {
    if (Number.isInteger(valueTab) && valueTab >= 0) {
      deleteWatchList(userwatchListId[0], exchangeSymbol);
    }
    const rowIndex = stockDisplayArr.findIndex(
      (row) => row.exchangeSymbol === exchangeSymbol
    );

    if (rowIndex !== -1) {
      const newData = [...stockDisplayArr];
      newData.splice(rowIndex, 1);
      stockDisplayArr = [...newData];
      stockDataDisplayMap.clear();
      stockDisplayArr.forEach((element, index) => {
        stockDataDisplayMap.set(element.exchangeSymbol, index);
      });
      setData([...stockDisplayArr]);
    }
  };

  const openDialog = (name, id) => {
    setDialogOpen(true);
    headerTitle = name;
    getIndicesStock(name, id);
    const timer = setInterval(() => {
      getIndicesStock(name, id);
    }, 1000);
    setPopupTimer(timer);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setIndicesStock([]);
    if (popupTimer) {
      clearInterval(popupTimer);
      setPopupTimer(null);
    }
  };

  const handleSnackbarClose = () => {
    setSnackBarOpen(false);
    setResponseStatus();
    setSeverity();
  };

  const handleLogout = () => {
    setProfileMenu(false);
    Cookies.remove("token");
    Cookies.remove("email");
    navigate("/");
  };

  const handleOpenPopup = () => {
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setProfileMenu(false);
    setPopupOpen(false);
  };

  const openNewDialog = () => {
    setProfileMenu(false);
    setDialogNewOpen(true);
  };

  handleAddStock = (input) => {
    if (input) {
      setUserInputs(input);
    }
  };

  const handleMouseEnter = () => {
    setProfileMenu(true);
  };

  const handleMouseLeave = () => {
    setProfileMenu(false);
  };

  const handleProfilemenu = () => {
    isMobile && setProfileMenu(!profileMenu);
  };

  const handleImageClick = () => {
    window.location.reload();
  };
   
  function openInNewTab(url) {

    if (socketClient) {
      socketClient.disconnect();
   
    }
    const newTab = window.open(url || "news", "_blank");
    if (newTab) {
     console.log('newTab', newTab.focus())
      newTab.focus();
    

    }

  }

  const calculatedValue = indicesStock.map((item) => item);

  function calculateCounts(data) {
    let advancingCount = 0;
    let decliningCount = 0;
    let unchangedCount = 0;

    data.forEach((obj) => {
      const change = obj.change;
      if (change > 0) {
        advancingCount++;
      } else if (change < 0) {
        decliningCount++;
      } else {
        unchangedCount++;
      }
    });

    return { advancingCount, decliningCount, unchangedCount };
  }

  const { advancingCount, decliningCount, unchangedCount } =
    calculateCounts(calculatedValue);

  const handleOpenPieChart = () => {
    setShowPieChart(true);
  };

  const pieChartOptions = {
    labels: ["Advance", "Decline", "Unchanged"],
    colors: ["#008000", "#C40233", "#BDBABB"],
    dataLabels: {
      formatter: function (val, opts) {
        const tooltipData = getTooltipData(opts);
        return tooltipData !== undefined ? tooltipData.toString() : "";
      },
    },
  };

  function getTooltipData(opts) {
    if (opts && opts.w && opts.w.globals) {
      const tooltipData = opts.w.globals.initialSeries[opts.seriesIndex];
      return tooltipData !== undefined ? tooltipData.toString() : "";
    }
    return "";
  }

  const pieChartData = [advancingCount, decliningCount, unchangedCount];

  const barGraphDialog = (barData, watchlistRange) => {
    const sortedData = [...barData]?.sort(
      (a, b) => b.percentChange - a.percentChange
    );

    const sliceSize = watchlistRange ? 15 : 5;
    const topPositive = sortedData
      ?.filter((item) => item.percentChange > 0)
      .slice(0, sliceSize);
    const topNegative = sortedData
      ?.filter((item) => item.percentChange < 0)
      .sort((a, b) => a.percentChange - b.percentChange)
      .slice(0, sliceSize);

    categories = [
      ...topPositive?.map((item) => item.name),
      ...topNegative?.map((item) => item.name),
    ];
    source = sortedData?.map((item) => item.exchangeId);
    minimum = -Math.max(...barData.map((item) => Math.abs(item.percentChange)));
    maximum = Math.max(...barData.map((item) => Math.abs(item.percentChange)));

    seriesData = [
      ...topPositive.map((item) => item.percentChange),
      ...topNegative.map((item) => item.percentChange),
    ];

    setOpen(true);
  };

  const getTextColor = (stock) => {
    const changePercentage =
      ((stock.lastPrice - stock.prevClose) / stock.prevClose) * 100;
    if (changePercentage > 0) {
      return 'green'; // Positive change
    } else if (changePercentage < 0) {
      return 'red'; // Negative change
    } else {
      return 'blue'; // No change
    }
  };

  // Function to calculate individual values
  const calculateRowValues = (row) => {
   
    const oneCrore = 10000000;
    const million = 1000000;
  
    const marketCap = (row?.marketCap || 0) / oneCrore; // Convert market cap to Crores
    const chngMktCap = ((row?.marketCap || 0) - (row?.prevMarketCap || 0)) / oneCrore; // Convert change in market cap to Crores
    const dayHighMarketCap = (row?.dayHigh || 0) * (row?.shareOutstanding || 0); // Day high * shares outstanding
    const dayLowMarketCap = (row?.dayLow || 0) * (row?.shareOutstanding || 0); // Day low * shares outstanding
    const dayOpenMarketCap = (row?.dayOpen || 0) * (row?.shareOutstanding || 0); // Day open * shares outstanding
    const accVolume = (row?.accVolume || 0) / million; // Convert accumulated volume to millions
    const avg30Volume = (row?.avg30Volume || 0) / million; // Convert 30-day average volume to millions
  
    return { 
      marketCap, 
      chngMktCap, 
      dayHighMarketCap, 
      dayLowMarketCap, 
      dayOpenMarketCap, 
      accVolume, 
      avg30Volume 
    };
  };
// Initialize totals
let totalMarketCap = 0;
let totalChngMktCap = 0;
let totalDayhighMarketCap = 0;
let totalDaylowMarketCap = 0;
let totalDayopenMarketCap = 0;
let totalVolume = 0;
let total30DayVolume = 0;

// Loop through postData to calculate and accumulate totals
popupData.forEach(row => {
  const { marketCap, chngMktCap, dayHighMarketCap, dayLowMarketCap, dayOpenMarketCap, accVolume, avg30Volume } = calculateRowValues(row);

  totalMarketCap += marketCap;
  totalChngMktCap += chngMktCap;
  totalDayhighMarketCap += dayHighMarketCap;
  totalDaylowMarketCap += dayLowMarketCap;
  totalDayopenMarketCap += dayOpenMarketCap;
  totalVolume += accVolume;
  total30DayVolume += avg30Volume;
});
//Akshay
//Sector Table
const columns = [
  { field: 'name', headerName: 'NAME', flex: 1, headerAlign: 'center', align: 'center' , minWidth: 200},
  { field: 'lastPrice', headerName: 'LAST PRICE', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'prevClose', headerName: 'PREV CLOSE', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'change', headerName: 'CHANGE', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'changePercentage', headerName: 'CHANGE%', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'accVolume', headerName: 'VOLUME (M)', flex: 1, headerAlign: 'center', align: 'center' , minWidth: 200},
  { field: 'fallFromHigh', headerName: 'Fall From High (%)', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'gainFromLow', headerName: 'Gain From Low (%)', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'dayOpen', headerName: 'OPEN', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'openPerc', headerName: 'OPEN (%)', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'dayHigh', headerName: 'HIGH', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'highPerc', headerName: 'HIGH (%)', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'dayLow', headerName: 'LOW', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'lowPerc', headerName: 'LOW (%)', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'avg30Volume', headerName: 'AVG30VOL (M)', flex: 1, headerAlign: 'center', align: 'center' , minWidth: 200},
  { field: 'marketCap', headerName: 'MKTCAP (Cr)', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'chngMarketCap', headerName: 'CHNG MKTCAP (Cr)', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'high52Week', headerName: '52 WK HG', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
  { field: 'fallFromhigh52Week', headerName: 'Fall From High 52 Week', flex: 1, headerAlign: 'center', align: 'center', minWidth: 250 },
  { field: 'gainFromlow52Week', headerName: 'Gain From Low 52 Week', flex: 1, headerAlign: 'center', align: 'center', minWidth: 250 },
  { field: 'low52Week', headerName: '52 WK LW', flex: 1, headerAlign: 'center', align: 'center', minWidth: 200 },
];


// Assuming popupData is your dataset
const rows = popupData.map((stock, index) => ({
  id: index,
  name: stock.name,
  lastPrice: stock.lastPrice.toFixed(2),
  prevClose: stock.prevClose.toFixed(2),
  change: (stock.lastPrice - stock.prevClose).toFixed(2),
  changePercentage: (((stock.lastPrice - stock.prevClose) / stock.prevClose) * 100).toFixed(2),
  accVolume: (stock.accVolume / 1000000).toFixed(2),
  fallFromHigh: (((stock?.lastPrice - stock?.dayHigh)/stock?.dayHigh) *100).toFixed(2),
  gainFromLow: (((stock?.lastPrice - stock?.dayLow)/stock?.dayLow) *100).toFixed(2),
  dayOpen: stock.dayOpen.toFixed(2),
  dayHigh: stock.dayHigh.toFixed(2),
  dayLow: stock.dayLow.toFixed(2),
  avg30Volume: (stock.avg30Volume / 1000000).toFixed(2),
  marketCap: (stock.marketCap / 10000000).toFixed(2),
  chngMarketCap: ((stock.marketCap - stock.prevMarketCap) / 10000000).toFixed(2),
  high52Week: stock.high52Week.toFixed(2),
  fallFromhigh52Week:(((stock.lastPrice - stock.high52Week)/stock.high52Week) *100).toFixed(2),
  low52Week: (((stock.lastPrice - stock.low52Week)/stock.low52Week) *100).toFixed(2),
  gainFromlow52Week: stock.low52Week.toFixed(2),
  openPerc:((((stock.dayOpen - stock.prevClose)/stock.prevClose)*100)).toFixed(2),
  lowPerc:((((stock.dayLow - stock.prevClose)/stock.prevClose)*100)).toFixed(2),
  highPerc: ((((stock.dayHigh - stock.prevClose)/stock.prevClose)*100)).toFixed(2),
  Turnover:(stock.lastPrice * stock.accVolume)
}));


  return (
    <>
      {/* Sector Dialog Box */}
      <div style={{ width: "1000px" }}>
      <Dialog open={opened} onClose={handleClosed}>
        <DialogTitle style={{fontWeight:'bold'}}>
          {stockName?.toUpperCase()}
         
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClosed}
            aria-label="close"
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      
        <DialogContent>
      
         <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        getRowClassName={(params) => {
          const change = parseFloat(params.row.change);
          if (change > 0) {
            return 'row-green';
          } else if (change < 0) {
            return 'row-red';
          } else {
            return 'row-blue';
          }
        }}
        sx={{
          '.MuiDataGrid-columnHeaders': {
            backgroundColor: 'rgb(0, 113, 98)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '15px',
            textAlign: 'center',
          },
          '.MuiDataGrid-cell': {
            textAlign: 'center',
            fontSize: '15px',
            fontWeight: 'bold',
          },
          '& .row-red': {
            color: 'red',
          },
          '& .row-green': {
            color: 'green',
          },
          '& .row-blue': {
            color: 'blue',
          },
        }}
      />
      <Typography
        style={{
          fontWeight: '600',
          fontSize: 'medium',
          color: 'black',
          marginTop: '10px',
        }}
      >
        SubTotal :- Day Open Market Cap: {(totalDayopenMarketCap / 10000000).toFixed(2)} Cr | 
        Day High Market Cap: {(totalDayhighMarketCap / 10000000).toFixed(2)} Cr | 
        Day Low Market Cap: {(totalDaylowMarketCap / 10000000).toFixed(2)} Cr | 
        Market Cap: {totalMarketCap.toFixed(2)} Cr | 
        Change Market Cap: {totalChngMktCap.toFixed(2)} Cr | 
        Volume: {totalVolume.toFixed(2)} M | 
        30-Day Volume: {total30DayVolume.toFixed(2)} M
      </Typography>
    </div>

        </DialogContent>
      </Dialog>
    </div>


      <Grid
        container
        sx={{
          backgroundColor: "#265073",
          padding: "2px 5px",
          borderRadius: "2px",
          
        }}
      >
        <Grid item xs={12} lg={9}>
    
          <Tabs
            value={valueTab}
            className="customTabs"
         
            variant="scrollable"
            style={{ minHeight: 35, height: 35 , alignItems:'center', color:'white'}}
            scrollButtons="auto"
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                sx={{
                  minHeight: 10,
                  color: "white !important",
                  height: 15,
                  marginTop: "5px",
                  borderLeft: "2px solid",
                }}
                className="profileMenu"
                onClick={(event) => {
                  event.stopPropagation();
                  if (tab.link === "home") {
                    handleImageClick();
                  } else {
                    openInNewTab(tab.link);
                  }
                }}
              />
            ))}
          </Tabs>
      
        </Grid>

        <Grid item xs={10} lg={1}  >
          <AlertsNews  token={token} navigate={navigate} />
        </Grid>

        {/* <Grid item xs={12} lg={1}>
          <Button
            variant="contained"
            size="small"
            sx={{
              backgroundColor: 'red',
              color: 'white',
              fontWeight: 'bold',
              marginTop: '2px',
            }}
            onClick={() => window.open('http://10.0.10.72:5502/Alliance_Breakout.html', '_blank')}
          >
           US Election
          </Button>
        </Grid> */}

        <Grid item xs={12} lg={2}>
          <div
            style={{
              display: "flex",
            
              justifyContent: `${isMobile ? "start" : "flex-end"}`,
            }}
          >

          {/* ak */}
            <Typography
              className="profile"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleProfilemenu}
            >
                   <Avatar>{emailInitials}</Avatar>
              {/* ↪ {email} */}
              {profileMenu && (
                <Grid   className="profileMenu-item">
                  <Typography
                    className="profileMenu"
                    sx={{display:'flex'}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPopup();
                    }}
                  >
                    CHANGE PASSWORD
                  </Typography>
                  <ChangePasswordPopup
                    open={isPopupOpen}
                    handleClose={(event, reason) => {
                      if (reason !== "backdropClick") {
                        handleClosePopup();
                      }
                    }}
                    setSnackBarOpen={setSnackBarOpen}
                    setResponseStatus={setResponseStatus}
                    setSeverity={setSeverity}
                    token={token}
                    email={email}
                  />
                  <Typography
                    className="profileMenu"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleLogout();
                    }}
                  >
                    LOGOUT
                  </Typography>
                </Grid>
              )}
            </Typography>
          </div>
      
        </Grid>

        
      </Grid>

      <Grid
        container
        alignItems="center"
        sx={{ padding: "2px 0px", borderRadius: "2px" }}
      >
        <Grid item xs={12} lg={1}>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            sx={{ fontWeight: "bold" }}
            onClick={(event) => {
              event.stopPropagation();
              openNewDialog();
            }}
          >
            Create Watchlist
          </Button>
        </Grid>
        <Grid
          item
          xs={12}
          lg={11}
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          {userInputs?.length > 0 ? (
            <CommonTabs
              headers={userInputs}
              onMenuChange={onMenuChange}
              value={valueTab}
              handleDeleteClick={handleDeleteClick}
            />
          ) : null}
        </Grid>
      </Grid>

      <Grid container sx={{ margin: "2px 0px" }}>
        {valueTab === false && (
          <Grid item xs={12} lg={1}>
            <Typography className="stockName">All INDICES</Typography>
          </Grid>
        )}

        {valueTab === false && (
          <Grid item xs={12} lg={5}>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={selectedValue || null}
              onChange={(e) => getIndices(e.target.value)}
            >
              {Object.keys(indices[0])?.map((item) => (
                <FormControlLabel
                  key={item}
                  value={item}
                  control={<Radio size="small" />}
                  label={item}
                />
              ))}
            </RadioGroup>
          </Grid>
        )}

        <>
          <Grid item xs={12} lg={valueTab === false ? 2 : 8}></Grid>

          {/* Search Radio Button */}

          <Grid item xs={12} lg={valueTab === false ? 2 : 2} margin="2px 0px">
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={selectedExchange || null}
              onChange={(e) => setSelectedExchange(e.target.value)}
            >
              {Object.keys(indices[0])?.map((item) => (
                <FormControlLabel
                  key={item}
                  value={item}
                  control={<Radio size="small" />}
                  label={item}
                />
              ))}
            </RadioGroup>
          </Grid>

          {/* Search Bar */}
          <Grid item xs={12} lg={valueTab === false ? 2 : 2}>
            <Autocomplete
              freeSolo
              id="free-solo-2-demo"
              disableClearable
              options={filters}
              getOptionLabel={(option) =>
                option.exchangeSymbol
                  ? `${option.name} | ${option.exchangeSymbol}`
                  : ""
              }
              autoFocus
              inputValue={searchInput}
              onInputChange={(event, newInputValue) =>
                setSearchInput(newInputValue)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  focused
                  autoFocus
                  label="Search"
                  placeholder="Search stocks"
                  variant="outlined"
                  onKeyUp={(e) => {
                    searchStock(e);
                  }}
                  size="small"
                />
              )}
            />
          </Grid>
        </>
      </Grid>

      {isDialogNewOpen && (
        <StockDetailsDialog
          open={isDialogNewOpen}
          onClose={(event, reason) => {
            if (reason !== "backdropClick") {
              setDialogNewOpen(false);
            }
          }}
          title={"CREATE WATCHLIST"}
          onAddStock={handleAddStock}
          userId={email}
          token={token}
          navigate={navigate}
          setSnackBarOpen={setSnackBarOpen}
          setResponseStatus={setResponseStatus}
          setSeverity={setSeverity}
        />
      )}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <CircularProgress disableShrink />
        </Box>
      ) : (
        <>
        
          <CustomTable
            header={header}
            data={data}
            buttonLabels={[]}
            color="#007162"
            height="75vh"
            isvisible={true}
            openDialog={openDialog}
            deleteRow={deleteRow}
            openInNewTab={openInNewTab}
            value={valueTab}
            navigate={navigate}
            stockName={stockName}
            openIn={true}
            barGraphDialog={barGraphDialog}
          />

          <CustomDialog
            setOpen={setOpen}
            open={open}
            categories={categories}
            seriesData={seriesData}
            minimum={minimum}
            maximum={maximum}
            source={source}
          />
          
        </>
      )}

      {
        <>
          <Dialog
            fullWidth
            maxWidth="xl"
            open={isDialogOpen}
            aria-labelledby="customized-dialog-title"
            onClose={(event, reason) => {
              if (reason !== "backdropClick") {
                closeDialog(event, reason);
              }
            }}
          >
            <div style={{ display: "flex", marginRight: "10px" }}>
              <DialogTitle
                sx={{ mr: 0, p: 2 }}
                id="customized-dialog-title"
                style={{
                  fontSize: "18px",
                  fontWeight: "bolder",
                  cursor: "pointer",
                }}
                onClick={handleOpenPieChart}
              >
                {headerTitle}
              </DialogTitle>

              <DialogTitle
                sx={{ mr: 0, p: 2 }}
                id="customized-dialog-title"
                style={{
                  fontSize: "18px",
                  fontWeight: "bolder",
                }}
              >
                {`Advance : ${advancingCount} `}
              </DialogTitle>

              <DialogTitle
                sx={{ mr: 0, p: 2 }}
                id="customized-dialog-title"
                style={{
                  fontSize: "18px",
                  fontWeight: "bolder",
                }}
              >
                {`Decline : ${decliningCount}`}
              </DialogTitle>

              <DialogTitle
                sx={{ mr: 0, p: 2 }}
                id="customized-dialog-title"
                style={{
                  fontSize: "18px",
                  fontWeight: "bolder",
                }}
              >
                {`Unchange : ${unchangedCount}`}
              </DialogTitle>
            </div>
            <IconButton
              aria-label="close"
              onClick={closeDialog}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent dividers>
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "60vh",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <CustomTable
                  header={header}
                  data={indicesStock}
                  buttonLabels={[]}
                  color="#007162"
                  deleteRow={deleteRow}
                  openInNewTab={openInNewTab}
                  height="80vh"
                  isvisible={false}
                  openIn={true}
                  barGraphDialog={barGraphDialog}
                />
              )}
            </DialogContent>
          </Dialog>

          <Dialog
            fullWidth
            maxWidth="sm"
            open={showPieChart}
            onClose={() => setShowPieChart(false)}
          >
            <DialogTitle variant="h5" style={{ fontWeight: "bold" }}>
              Market Breadth
            </DialogTitle>
            <IconButton
              aria-label="close"
              onClick={() => setShowPieChart(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>

            <DialogContent dividers>
              <DialogTitle variant="h6" style={{ fontWeight: "bold" }}>
                {headerTitle}
              </DialogTitle>
              <Box style={{ width: "100%", height: 400 }}>
                <Chart
                  options={pieChartOptions}
                  series={pieChartData}
                  type="pie"
                  width="100%"
                  height="400"
                />
              </Box>
            </DialogContent>
          </Dialog>
        </>
      }

      {
        <SnackbarPopup
          snackBarOpen={snackBarOpen}
          responseStatus={responseStatus}
          handleSnackbarClose={handleSnackbarClose}
          severity={severity}
        />
      }
    </>
  );
};

export default InterestedTable;
