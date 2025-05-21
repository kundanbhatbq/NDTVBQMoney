import React, { useState, useEffect , useMemo} from "react";
import {
  Autocomplete,
  Grid,
  Paper,
  TextField,
  Typography,
  Box
} from "@mui/material";
import "./index.scss";
import { GraphWithMonthSelection } from "../../common/common";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";
import { apiConfigNewsFlash } from "../../commonApi/apiConfig";
import { VisibleColumnsBasicExample } from "../../common/common";
import { openInterestColumns, openCPColumns, OISinceExpiry, columnGroupingModel } from "./data";
import TwoLineChart from "../../Chart/AreaLineChart";
import ThreeLineChart from "../../Chart/AreaThreeChart";
import FnoLinegraph from "../../Chart/FnoLinegraph";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FIIFNO from "./FIIFNO"
import Client from "./Client"



import { styled } from '@mui/material/styles';

// const openInterestButtons = ["FUTURES"];
const monthDataOptions = {
  Monthly: ["1m", "2m", "3m"],
  Weekly: ["1w", "2w", "3w"],
  "Cumulative Monthly": ["1c", "2c", "3c"],
};

const minData = {
  Monthly: ["1", "5", "15", "60"],
};

const graphType = {
  Type: ["CALL/PUT", "BREAKEVEN"],
  TableType: ["FUTURES", "OPTIONS", 'OI SINCE LAST EXPIRY','TRENDS', 'FII FNO', 'CLIENT'],
  OptionType: ["INDEX", "STOCKS"],

  
};

const FOBreakdownType = {
  FOType: ["INDEX", "STOCKS"],
}

const Fut = {
  Type :["Accumulation", "Liquidation","Short Covering", "Fresh Shorts"]
}




const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize:'16px',
 // Add border to all sides
  textAlign: 'center',
  padding: '8px', // Adjust padding for compact view
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
 
  fontSize:'14px',
  borderBottom:'1px solid white'
// Add border to rows
}));
const Fno = () => {
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1");
  const [exchangeId, setExchangeId] = useState("INDEX");
  const [exchangeIdFOtYPE, setexchangeIdFOtYPE] = useState("INDEX");
  const[FutureType, setfutureType] = useState("Accumulation")
  const [activeType, setActiveType] = useState("CALL/PUT");
  const [activeTable, setActiveTable] = useState("FUTURES");
  const [Futures, setFutures] = useState([]);
  const [Options, setOptions] = useState([]);
  const [OiGraph, setOiGraph] = useState([]);
  const [breakEvenGraph, setBreakEvenGraph] = useState([]);
  const [futuresGraph, setFuturesGraph] = useState([]);
  const [searchValue, setSearchValue] = useState("NIFTY 50");
  const [searchTerm, setsearchTerm]= useState()
  //NEW CHANGE
  const[call, setCall]=useState()
  const[put,setPut]= useState()

  //NEW CHANGE F&0 BREAKDONW
  const[FOBreakdown, setFOBreakdown] = useState()
  const[exchangeIdFO, setExchangeIdFO] = useState(1)
  const [filteredFOBreakdown, setFilteredFOBreakdown] = useState([]);
  useEffect(() => {
    setFilteredFOBreakdown(FOBreakdown);
  }, [FOBreakdown]);
  //TRENDS
  const[trends, setTrends] =useState("Accumulation")
  const[trendsResponse, settrendsResponse] = useState([])
  const [price, setPrice] = useState(1)
  const [oi, setoi] = useState(1)
  const [filteredTrends, setfilteredTrends] = useState()

  //FILTER LOGIC
  const [sortDirection, setSortDirection] = useState('asc'); // Initial sort direction
const [sortKey, setSortKey] = useState(null); // Initial sort key

const [TrendsortKey, setTrendSortKey] = useState(null); // Initial sort key
const [sortTrendDirection, setTrendSortDirection] = useState('asc');






const sortedFOBreakdown = useMemo(() => {
  if (!sortKey) return filteredFOBreakdown; // Return original data if no sort key

  const sortedData = [...filteredFOBreakdown]; // Create a copy to avoid mutating the original array


  sortedData.sort((a, b) => {
      const aValue = parseFloat(a[sortKey]); // Parse to float for correct sorting
      const bValue = parseFloat(b[sortKey]);

   

      if (sortDirection === 'asc') {
          return aValue - bValue;
      } else {
          return bValue - aValue;
      }
  });

  return sortedData;
}, [filteredFOBreakdown, sortKey, sortDirection]); // Re-calculate when data or sort criteria change



const sortedTrends =  useMemo(() => {
  if (!TrendsortKey) return filteredTrends; // Return original data if no sort key

  const sortedData = [...filteredTrends]; // Create a copy to avoid mutating the original array
 

  sortedData.sort((a, b) => {
      const aValue = parseFloat(a[TrendsortKey]); // Parse to float for correct sorting
      const bValue = parseFloat(b[TrendsortKey]);

   

      if (sortTrendDirection === 'asc') {
          return aValue - bValue;
      } else {
          return bValue - aValue;
      }
  });

  return sortedData;
}, [filteredTrends, TrendsortKey, sortTrendDirection]);

const handleSort = (key) => {
  if (key === sortKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); // Toggle direction
  } else {
      setSortKey(key); // Set new sort key
      setSortDirection('asc'); // Default to ascending for new key
  }
};



const handleSortTrends = (key) => {
  if (key === TrendsortKey) {
    setTrendSortDirection(sortTrendDirection === 'asc' ? 'desc' : 'asc'); // Toggle direction
  } else {
    setTrendSortKey(key); // Set new sort key
    setTrendSortDirection('asc'); // Default to ascending for new key
  }
};
 
  useEffect(() => {
    setfilteredTrends(trendsResponse);
  }, [trendsResponse]);



  // const [FutureExpipry, setFuturesExpiry] = useState();
  // setFuturesExpiry(rows)
  if (Array.isArray(FOBreakdown)) {
    FOBreakdown.forEach((data) => {
      console.log("fo", data["call-open-interest"]);
    });
  } else {
    console.error('FOBreakdown is not defined or not an array');
  }
  








  let sanitizedValue = searchValue?.replace(/&/g, "%26");


//NEW CHANGE
useEffect(() => {
    if (OiGraph?.lineData && Array.isArray(OiGraph.lineData)) {
        OiGraph.lineData.forEach((item) => {
            if (Array.isArray(item) && item.length >= 2) {
                setCall(item[0]);
                setPut(item[1]);
            } else {
                console.log('Item is not an array with the expected structure', item);
            }
        });
    } else {
        console.log('OiGraph.lineData is undefined or not an array');
    }
}, [OiGraph]); // The effect runs only when OiGraph.lineData changes



  useEffect(() => {
    const fetchData = async () => {
      const tokenFromCookies = Cookies.get("token");
      if (tokenFromCookies) {
        setToken(tokenFromCookies);
        await getFutures();
      } else {
        navigate("/");
      }
    };

    fetchData();

    // const intervalId = setInterval(fetchData, 30000);
    // return () => clearInterval(intervalId);
  }, []);


  
  useEffect(() => {
 

    if( activeTable === "OI SINCE LAST EXPIRY"){
     getFandOBreakDwon();
    
    
    }
    setsearchTerm("") 

  
    
  }, [activeTable, exchangeIdFO]);

  useEffect(() => {
 

    if( activeTable === "TRENDS"){
     getTrends();
    
    
    }
    setsearchTerm("") 
    
  }, [activeTable,trends]);



  

  useEffect(() => {
    const fetchData = async () => {
      const tokenFromCookies = Cookies.get("token");
      if (tokenFromCookies) {
        setToken(tokenFromCookies);
        if (exchangeId === "FUTURES") {
          await getFuturesGraph();
        } else {
          await getOptions();
        }
      } else {
        navigate("/");
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [searchValue, activeTable, exchangeId]);

  useEffect(() => {
    const fetchData = async () => {
      const tokenFromCookies = Cookies.get("token");
      if (tokenFromCookies) {
        setToken(tokenFromCookies);
        if (activeType === "CALL/PUT") {
          await getOiGraph();
        } else {
          await getBreakEvenGraph();

        }
      } else {
        navigate("/");
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [searchValue, activeTab, activeType]);

  const getFutures = async () => {
    const getFuturesEndpoint = `fando/getFutures`;
    try {
      const response = await apiConfigNewsFlash(`${getFuturesEndpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFutures(response);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
      setFutures([]);
      console.error(error);
    }
  };

  const getOptions = async () => {
    const getFuturesEndpoint = `fando/getOptions?instrumentId=${exchangeId === "INDEX" ? 1 : 2}`;
    try {
      const response = await apiConfigNewsFlash(`${getFuturesEndpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOptions(response);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
      setOptions([]);
      console.error(error);
    }
  };

  const getFuturesGraph = async () => {
    const getFutures = `fando/getDistribution?exchangeSymbol=${sanitizedValue || "NIFTY 50"
      }&type=1m`;
    try {
      const response = await apiConfigNewsFlash(`${getFutures}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFuturesGraph(response);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
      setFuturesGraph([]);
      console.error(error);
    }
  };

  const getOiGraph = async () => {
    const getFuturesEndpoint = `fando/getOiGraph?exchangeSymbol=${sanitizedValue}&interval=${activeTab}`;
    try {
      const response = await apiConfigNewsFlash(`${getFuturesEndpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOiGraph(response);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
      setOiGraph([]);
      console.error(error);
    }
  };

  const getBreakEvenGraph = async () => {
    const getFuturesEndpoint = `fando/getBreakEvenGraph?exchangeSymbol=${sanitizedValue}`;
    try {
      const response = await apiConfigNewsFlash(`${getFuturesEndpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      setBreakEvenGraph(response);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
      setBreakEvenGraph([]);
      console.error(error);
    }
  };

  const getFandOBreakDwon =   async () => {
    const getFuturesEndpoint = `fando/getFOBreakUp?instrument=${exchangeIdFO}&lastExpiry=true
`;
    try {
      const response = await apiConfigNewsFlash(`${getFuturesEndpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("foresponse", response.data)
      setFOBreakdown(response.data);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
      setFOBreakdown([]);
      console.error(error);
    }
  };

const getTrends = async () => {
  const getFuturesEndpoint = `fando/getByhedging?price=${price}&oi=${oi}&order=1&limit=200
`;
  try {
    const response = await apiConfigNewsFlash(`${getFuturesEndpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    settrendsResponse(response.data);
  } catch (error) {
    if (token === "") {
      Cookies.remove("token");
      Cookies.remove("email");
      navigate("/");
    }
    setFOBreakdown([]);
    console.error(error);
  }
};

  const exchangeOptions = Futures.map((future) => ({
    name: future.name,
    exchangeSymbol: future.exchangeSymbol,
  }));

  const handleSearchChange = (event, value) => {
    setSearchValue(value ? value.exchangeSymbol : "");
  };

  const strikePrice = (put/call).toFixed(2)

  const searchStock = (event) => {
    setsearchTerm(event.target.value.toUpperCase());
    
    // If search term is empty, show all data
    if (!searchTerm) {
      setFilteredFOBreakdown(FOBreakdown);
      return;
    }
    
    // Filter data based on search term
    const filtered = FOBreakdown.filter(item => {
      // Adjust these properties based on your actual data structure
      return (
       
        item["symbol-strike"]?.toUpperCase().includes(searchTerm) 
       
        // Add more fields to search through as needed
      );
    });
    
    setFilteredFOBreakdown(filtered);
  };

  const searchTrends = (event) => {
    setsearchTerm(event.target.value.toUpperCase());
    
    // If search term is empty, show all data
    if (!searchTerm) {
      setfilteredTrends(trendsResponse);
      return;
    }
    
    // Filter data based on search term
    const filtered = trendsResponse.filter(item => {
      // Adjust these properties based on your actual data structure
      return (
       
        item["symbol"]?.toUpperCase().includes(searchTerm) 
       
        // Add more fields to search through as needed
      );
    });
    
    setfilteredTrends(filtered);
  };

  return (
    <>
      <Grid className="container">
        <Autocomplete
          size="small"
          freeSolo
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          id="free-solo-with-text-demo"
          options={exchangeOptions}
          getOptionLabel={(option) => option.name || "NIFTY 50"}
          PopperComponent={(props) => (
            <Paper {...props}>{props.children}</Paper>
          )}
          value={
            exchangeOptions.find(
              (option) => option.exchangeSymbol === searchValue
            ) || "NIFTY 50"
          }
          onChange={handleSearchChange}
          renderInput={(params) => (
            <TextField
              {...params}
              autoFocus
              placeholder="Search stocks..."
              label="Search"
              margin="normal"
              variant="outlined"
            />
          )}
        />
      </Grid>
      <Grid className="graph-container">
        <GraphWithMonthSelection
          title="Open Interest Change"
          monthDataOptions={monthDataOptions}
          searchValue={searchValue}
        />
        <GraphWithMonthSelection
          title="Open Interest Distribution"
          monthDataOptions={monthDataOptions}
          searchValue={searchValue}
        />
      </Grid>

      <Grid className="table-head">
        {searchValue?.toLowerCase().includes("nifty") && (
          <>
            <Grid className="graph-month-container">
              <Grid className="graph-type">
                {graphType?.Type?.map((resp, index) => (
                  <button
                    className={`graph-month-btn ${activeType === resp && "graph-month-active"
                      }`}
                    key={index}
                    onClick={() => setActiveType(resp)}
                  >
                    {resp}
                  </button>
                ))}
              </Grid>
            </Grid>
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              className="chart-header"
            >
              <Grid item>
                <Typography variant="h6" gutterBottom>
                  {searchValue}
                </Typography>
              </Grid>
              {activeType === "CALL/PUT" && (
                <Grid item className="graph-min">
                  {minData?.Monthly?.map((resp, index) => (
                    <button
                      className={`graph-month-btn ${activeTab === resp && "graph-month-active"
                        }`}
                      key={index}
                      onClick={() => setActiveTab(resp)}
                    >
                      {`${resp}m`}
                    </button>
                  ))}
                </Grid>
              )}
            </Grid>
            {activeType === "CALL/PUT" ? (
              <TwoLineChart OiGraph={OiGraph} strikePrice={strikePrice || []} />
            ) : (
              <ThreeLineChart breakEven={breakEvenGraph} />
            )}
          </>
        )}
      </Grid>
      <Grid>
        <FnoLinegraph token={token} />
      </Grid>

      <Grid className="table-head">
        <Grid className="graph-month-container" sx={{display:'flex', justifyContent:'space-between'}}>
          <Grid className="graph-type3" >
            {graphType?.TableType?.map((resp, index) => (
              <button
                className={`graph-month-btn ${activeTable === resp && "graph-month-active"
                  }`}
                key={index}
                onClick={() => setActiveTable(resp)}
                
              >
                {resp}
              </button>
            ))}
          </Grid>
        </Grid>
        {activeTable === "OPTIONS" && <Grid className="graph-month-container">
          <Grid className="graph-type">
            {graphType?.OptionType?.map((resp, index) => (
              <button
                className={`graph-month-btn ${exchangeId === resp && "graph-month-active"
                  }`}
                key={index}
                onClick={() => setExchangeId(resp)}
              >
                {resp}
              </button>
            ))}
          </Grid>
        </Grid>}

        {
  activeTable === "FUTURES" ? (
    <VisibleColumnsBasicExample
      columns={openInterestColumns}
      rows={Futures}
      // buttonLabels={openInterestButtons || []}
      density="compact"
      height={550}
      width={"100%"}
    />
  ) : activeTable === "OI SINCE LAST EXPIRY" ? (

      <Grid>
        <Grid sx={{fontWeight:'bold', fontSize:'25px', display:'flex', justifyContent:'center'}}>F&O OPEN INTEREST CHANGE SINCE LAST EXPIRY</Grid>
       
     <Grid sx={{display:'flex', justifyContent:'space-between'}}>
     <TextField id="standard-basic" sx={{marginBottom:'10px', width:'300px'}}value={searchTerm} onChange={searchStock} label="Search Stock" variant="standard" />  
    
     <Grid className="graph-type" width={300} height={40}>
    {FOBreakdownType?.FOType?.map((resp, index) => (
    <button
      className={`graph-month-btn ${exchangeIdFOtYPE === resp ? "graph-month-active" : ""}`}
      key={index}
      onClick={() => {
        if (resp === 'INDEX') {
          setExchangeIdFO(1);
          setexchangeIdFOtYPE(resp);
        } else {
          setExchangeIdFO(2);
          setexchangeIdFOtYPE(resp);
        }
      }}
    >
      {resp}
    </button>
  ))}
</Grid>
     </Grid>
     <TableContainer 
  component={Paper} 
  sx={{ 
    maxHeight: "70vh", 
    overflow: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "8px"
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#DADEE1",
      borderRadius: "4px"
    }
  }}
>
  <Table stickyHeader sx={{ minWidth: 650, minHeight:300}}>


    <TableHead style={{ position: 'sticky', top: 0, zIndex: 11 }}>
      <TableRow style={{
      background: "#DADEE1",
        boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' 
      }}>
        <StyledTableCell colSpan={1}sx={{color: '#4f5d65', background: "#DADEE1",}} align="center"></StyledTableCell>
        <StyledTableCell colSpan={1}sx={{color: '#4f5d65', background: "#DADEE1",}} align="center"></StyledTableCell>
        <StyledTableCell colSpan={1}sx={{color: '#4f5d65', background: "#DADEE1",}} align="center"></StyledTableCell>
        <StyledTableCell colSpan={2} sx={{color: '#4f5d65', background: "#DADEE1",}} align="center">FUTURES</StyledTableCell>
        <StyledTableCell colSpan={2} sx={{color: '#4f5d65', background: "#DADEE1",}} align="center">CALLS</StyledTableCell>
        <StyledTableCell colSpan={2} sx={{color: '#4f5d65', background: "#DADEE1",}} align="center">PUTS</StyledTableCell>
        <StyledTableCell colSpan={2} sx={{color: '#4f5d65', background: "#DADEE1",}} align="left">TOTAL</StyledTableCell>
      </TableRow>
      <TableRow style={{
        background: '#DADEE1', 
        boxShadow: '0px 1px 3px rgba(0,0,0,0.1)'
      }}>
        <StyledTableCell sx={{color: '#8f9da5', background:'white'}}>SYMBOL</StyledTableCell>
        <StyledTableCell onClick={() => handleSort('last_price')} sx={{color: '#8f9da5', background: "#F3F3F5"}}>LAST PRICE {sortKey === 'last_price' && (sortDirection === 'asc' ? '▲' : '▼')}</StyledTableCell>
        <StyledTableCell  onClick={() => handleSort('percentChange')} sx={{color: '#8f9da5', background: "#F3F3F5"}}>CHANGE(%) {sortKey === 'percentChange' && (sortDirection === 'asc' ? '▲' : '▼')}</StyledTableCell>
        <StyledTableCell onClick={() => handleSort('future-open-interest')}   sx={{color: '#8f9da5',background:'white' }}>OPEN INTEREST (IN CONTRACTS) {sortKey === 'future-open-interest' && (sortDirection === 'asc' ? '▲' : '▼')}</StyledTableCell>
        <StyledTableCell  onClick={() => handleSort('future-open-interest-change-percentage')} sx={{color: '#8f9da5',background:'white' }}>OI % CHANGE {sortKey === 'future-open-interest-change-percentage' && (sortDirection === 'asc' ? '▲' : '▼')}</StyledTableCell>
        <StyledTableCell onClick={() => handleSort('call-open-interest')} sx={{color: '#8f9da5', background: "#F3F3F5"}}>OPEN INTEREST (IN CONTRACTS) {sortKey === 'call-open-interest' && (sortDirection === 'asc' ? '▲' : '▼')}</StyledTableCell>
        <StyledTableCell onClick={() => handleSort('call-open-interest-change-percentage')} sx={{color: '#8f9da5', background: "#F3F3F5"}}>OI % CHANGE {sortKey === 'call-open-interest-change-percentage' && (sortDirection === 'asc' ? '▲' : '▼')}</StyledTableCell>
        <StyledTableCell  onClick={() => handleSort('put-open-interest')} sx={{color: '#8f9da5',background:'white' }}>OPEN INTEREST (IN CONTRACTS) {sortKey === 'put-open-interest' && (sortDirection === 'asc' ? '▲' : '▼')}</StyledTableCell>
        <StyledTableCell  onClick={() => handleSort('put-open-interest-change-percentage')} sx={{color: '#8f9da5',background:'white' }}>OI % CHANGE  {sortKey === 'put-open-interest-change-percentage' && (sortDirection === 'asc' ? '▲' : '▼')}</StyledTableCell>
        <StyledTableCell  onClick={() => handleSort('total-open-interest')} sx={{color: '#8f9da5', background: "#F3F3F5"}}>OPEN INTEREST (IN CONTRACTS) {sortKey === 'total-open-interest' && (sortDirection === 'asc' ? '▲' : '▼')}</StyledTableCell>
        <StyledTableCell 
            onClick={() => handleSort('total-open-interest-change-percentage')} // Add onClick
            style={{ cursor: 'pointer',  background: "#F3F3F5" ,color: '#8f9da5'}} // Indicate it's clickable
        >
             OI % CHANGE {sortKey === 'total-open-interest-change-percentage' && (sortDirection === 'asc' ? '▲' : '▼')} {/* Add sort indicator */}
        </StyledTableCell>
      </TableRow>
    </TableHead>
    <TableBody >
      {Array.isArray(sortedFOBreakdown) ? (
        sortedFOBreakdown.map((item, index) => (
          <StyledTableRow key={`${item['symbol-strike']}-${index}`}>
            <TableCell component="th" align="center" scope="row" sx={{ padding: '8px', fontWeight: 'bold', fontSize: '14px', color: '#0068d7' }}>
              {item['symbol-strike']}
            </TableCell>
            <TableCell align="center" sx={{ padding: '8px', background: "#F3F3F5", fontWeight: 'bold', fontSize: '14px', color: item.last_price > 0 ? 'green' : 'red' }}>
              {item.last_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </TableCell>
            <TableCell align="center" sx={{ padding: '8px', fontWeight: 'bold', background: "#F3F3F5", fontSize: '14px', color: item.percentChange > 0 ? 'green' : 'red' }}>
              {item.percentChange.toFixed(2)}%
            </TableCell>
            <TableCell align="center" sx={{ padding: '8px', fontWeight: 'bold' }}>
              {item['future-open-interest'].toLocaleString()}
            </TableCell>
            <TableCell align="center" sx={{ padding: '8px', color: item['future-open-interest-change-percentage'] > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
              {item['future-open-interest-change-percentage'].toFixed(2)}%
            </TableCell>
            <TableCell align="center" sx={{ padding: '8px', background: "#F3F3F5", fontWeight: 'bold' }}>
              {item['call-open-interest'].toLocaleString()}
            </TableCell>
            <TableCell align="center" sx={{ padding: '8px', background: "#F3F3F5", color: item['call-open-interest-change-percentage'] > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
              {item['call-open-interest-change-percentage'].toFixed(2)}%
            </TableCell>
            <TableCell align="center" sx={{ padding: '8px', fontWeight: 'bold' }}>
              {item['put-open-interest'].toLocaleString()}
            </TableCell>
            <TableCell align="center" sx={{ padding: '8px', color: item['put-open-interest-change-percentage'] > 0 ? 'green' : item['put-open-interest-change-percentage'] < 0 ? 'red' : 'blue', fontWeight: 'bold' }}>
              {item['put-open-interest-change-percentage'].toFixed(2)}%
            </TableCell>
            <TableCell align="center" sx={{ padding: '8px', background: "#F3F3F5", fontWeight: 'bold' }}>
              {item['total-open-interest'].toLocaleString()}
            </TableCell>
            <TableCell align="center" sx={{ padding: '8px', background: "#F3F3F5", color: item['total-open-interest-change-percentage'] > 0 ? 'green' : item['total-open-interest-change-percentage'] < 0 ? 'red' : 'blue', fontWeight: 'bold' }}>
              {item['total-open-interest-change-percentage'].toFixed(2)}%
            </TableCell>
         
          </StyledTableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={13} align="center">
           LOADING.....
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>
      </Grid>

  
   
  ) 
  : activeTable === "CLIENT" ? (
    <Client/>
  ): activeTable === "FII FNO" ? (
 <FIIFNO/>  
  )
  : activeTable === "TRENDS" ? (

    <Grid>
      <Grid sx={{fontWeight:'bold', fontSize:'25px', display:'flex', justifyContent:'center'}}></Grid>
     
   <Grid sx={{display:'flex', justifyContent:'space-between'}}>

   <TextField id="standard-basic" sx={{marginBottom:'10px', width:'300px'}} value={searchTerm} onChange={searchTrends} label="Search Stock" variant="standard" />  
   
   <Grid className="graph-type2" width={600} height={50} >
{Fut?.Type?.map((resp, index) => (
  <button
    className={`graph-month-btn ${trends === resp ? "graph-month-active" : ""}`}
    key={index}
    onClick={() => {
      if (resp === 'Accumulation') {
        setPrice(1);
        setoi(1);
        setTrends(resp);
      }  else if (resp === 'Liquidation') {
        setPrice(0);
        setoi(0);
        setTrends(resp);
      } else if (resp === 'Short Covering'){
        setPrice(1);
        setoi(0);
        setTrends(resp);
      } else {
        setPrice(0);
        setoi(1);
        setTrends(resp);
      }
    }}
  >
    {resp}
  </button>
))}
</Grid>

   </Grid>
    
  
    

   <TableContainer 
component={Paper} 
sx={{ 
  maxHeight: "70vh", 
  overflow: "auto",
  "&::-webkit-scrollbar": {
    width: "8px",
    height: "8px"
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#DADEE1",
    borderRadius: "4px"
  }
}}
>
<Table stickyHeader sx={{ minWidth: 650, minHeight:300}}>


  <TableHead style={{ position: 'sticky', top: 0, zIndex: 11 }}>
 
    <TableRow style={{
      background: '#DADEE1', 
      boxShadow: '0px 1px 3px rgba(0,0,0,0.1)'
    }}>
      <StyledTableCell sx={{color: '#4f5d65', background: "#DADEE1", cursor:'pointer'}}>SYMBOL</StyledTableCell>
      <StyledTableCell onClick={() => handleSortTrends('expiry-date')} sx={{color: '#4f5d65', background: "#DADEE1", cursor:'pointer'}}>Expiry {TrendsortKey ==='expiry-date' && (sortTrendDirection === 'asc' ? '▲' : '▼')}	</StyledTableCell>
      <StyledTableCell onClick={() => handleSortTrends('future')} sx={{color: '#4f5d65', background: "#DADEE1",cursor:'pointer'}}>Price(Futures) {TrendsortKey ==='future' && (sortTrendDirection === 'asc' ? '▲' : '▼')}</StyledTableCell>
      <StyledTableCell onClick={() => handleSortTrends('cmp-change')} sx={{color: '#4f5d65', background: "#DADEE1",cursor:'pointer'}}>Change {TrendsortKey ==='cmp-change' && (sortTrendDirection === 'asc' ? '▲' : '▼')}	</StyledTableCell>
      <StyledTableCell onClick={() => handleSortTrends('cmp-change-percentage')} sx={{color: '#4f5d65', background: "#DADEE1",cursor:'pointer'}}>% Change {TrendsortKey ==='cmp-change-percentage' && (sortTrendDirection === 'asc' ? '▲' : '▼')}</StyledTableCell>
      <StyledTableCell  onClick={() => handleSortTrends('basis')}  sx={{color: '#4f5d65', background: "#DADEE1",cursor:'pointer'}}>Basis  {TrendsortKey ==='basis' && (sortTrendDirection === 'asc' ? '▲' : '▼')} </StyledTableCell>
     
      <StyledTableCell onClick={() => handleSortTrends('open-interest')} sx={{color: '#4f5d65', background: "#DADEE1",cursor:'pointer' }}  >Open Interest (In Contracts) {TrendsortKey ==='open-interest' && (sortTrendDirection === 'asc' ? '▲' : '▼')} </StyledTableCell>

      <StyledTableCell 
            onClick={() => handleSortTrends('open-interest-change-percentage')} // Add onClick
            style={{ cursor: 'pointer',  color: '#4f5d65', background: "#DADEE1", cursor:'pointer'}} // Indicate it's clickable
        >
             Open Interest(% Change) {TrendsortKey ==='open-interest-change-percentage' && (sortTrendDirection === 'asc' ? '▲' : '▼')} {/* Add sort indicator */}
        </StyledTableCell>

     
    </TableRow>
  </TableHead>
  <TableBody >
    {Array.isArray(sortedTrends) ? (
      sortedTrends.map((item, index) => (
        <StyledTableRow key={`${item['symbol-strike']}-${index}`}>
          <TableCell component="th" align="center" scope="row" sx={{ padding: '8px', fontWeight: 'bold', fontSize: '14px', color: '#0068d7' }}>
            {item['symbol']}
          </TableCell>
          <TableCell align="center" sx={{ padding: '8px',  fontWeight: 'bold', fontSize: '14px'}}>
            {item['expiry-date']}
          </TableCell>
          <TableCell align="center" sx={{ padding: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            {item.future}
          </TableCell>
          <TableCell align="center" sx={{ padding: '8px', fontWeight: 'bold', color: item['cmp-change'] > 0 ? 'green' : 'red' }}>
            {item['cmp-change'].toFixed(2)}
          </TableCell>
          <TableCell align="center" sx={{ padding: '8px', color: item['cmp-change-percentage'] > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
            {item['cmp-change-percentage'].toFixed(2)}%
          </TableCell>
          <TableCell align="center" sx={{ padding: '8px',color: item.basis > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
            {item.basis}
          </TableCell>
          <TableCell align="center" sx={{ padding: '8px', fontWeight: 'bold' }}>
            {item['open-interest']}
          </TableCell>
          <TableCell align="center" sx={{ padding: '8px',color: item['open-interest-change-percentage'] > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
            {item['open-interest-change-percentage'].toFixed(2)}%
          </TableCell>
       
        </StyledTableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan={13} align="center">
         LOADING.....
        </TableCell>
      </TableRow>
    )}
  </TableBody>
</Table>
</TableContainer>
    </Grid>


 
):
 
(
    <>
      <Grid container className="table-tab2">
        <Grid item xs={6}>
          CALL
        </Grid>
        <Grid item xs={6}>
          PUT
        </Grid>
      </Grid>
      <VisibleColumnsBasicExample
        columns={openCPColumns}
        rows={Options}
        density="compact"
        height={550}
        width={"100%"}
      />
    </>
  )
}




      </Grid>
    </>
  );
};

export default Fno;
