import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Box,
  Grid,
  Tooltip,
  Typography,
  TextField,
  Autocomplete,
  Paper,
  Button,
  CircularProgress,
  InputLabel,
  Select,
  MenuItem
  
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import Cookies from "js-cookie";
import { apiConfig } from "../../commonApi/apiConfig";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const HLC = () => {
  const getFormattedDate = (date) => date.toISOString().split("T")[0];

  const currentDate = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

  const navigate = useNavigate();
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  const [response, setResponse] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);

  // Default stock is NIFTY 50
  const [selectedStockCurrent, setSelectedStockCurrent] = useState({ exchangeSymbol: "NIFTY 50" });
  const selectedStockRef = useRef({ exchangeSymbol: "NIFTY 50" }); // Store latest value

  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState(getFormattedDate(oneYearAgo));
  const [endDate, setEndDate] = useState(getFormattedDate(currentDate));
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("NIFTY 50");
  const [currentDayData, setCurrentDayData] = useState();
    const [selectedExchange, setSelectedExchange] = useState(1);


    
console.log('selectedExchange', selectedExchange)



  useEffect(() => {
    const tokenFromCookies = Cookies.get("token");
    if (tokenFromCookies) {
      setToken(tokenFromCookies);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const getStocks = async () => {
    try {
      const res = await apiConfig(
        `searchStocks?exchangeId=${selectedExchange}&text=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResponse(res || []);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    }
  };

  const fetchHistoricalData = async () => {
    setIsLoading(true);
    
    try {
      const res = await apiConfig(
        `gethlc?startDate=${startDate}&endDate=${endDate}&exchangeSymbol=${selectedStock?.exchangeSymbol || "NIFTY 50"}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const dataWithIds = res.map((item, index) => ({
        ...item,
        id: index,
      }));
  
      setHistoricalData(dataWithIds);
      setName(selectedStock?.name || "NIFTY 50");
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setHistoricalData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentDayData = async (stockSymbol) => {
    try {
      const currentDataResponse = await apiConfig(
        `dashboard?exchangeSymbol=${stockSymbol}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCurrentDayData(currentDataResponse);
    } catch (error) {
      console.error("Error fetching current day data:", error);
    }
  };

  useEffect(() => {
    if (Array.isArray(response)) {
      setFilteredData(response);
    } else {
      console.error("Response is not an array", response);
      setFilteredData([]);
    }
  }, [response]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      getStocks();
    }
  }, [searchQuery]);


 

  // Initial data load on component mount
  useEffect(() => {
    fetchHistoricalData();
    getCurrentDayData("NIFTY 50");
    
    // Set up interval for current day data for the currently displayed stock
    const interval = setInterval(() => {
      getCurrentDayData(selectedStockRef.current.exchangeSymbol);
    }, 1000);

    return () => clearInterval(interval);
  }, [token]);
  
  const handleSearchChange = (event, newInputValue) => {
    setSearchQuery(newInputValue);
  };

  const handleOptionChange = (event, newValue) => {
    if (newValue) {
      // Only update selectedStock, don't trigger any API calls yet
      setSelectedStock(newValue);
      // But update the search query for visual consistency
      setSearchQuery(newValue.name || "");
    }
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

    // Handle exchange selection change
    const handleExchangeChange = (event) => {
      setSelectedExchange(event.target.value);
    };
    
  const handleSubmit = () => {
    // On submit, update both the historical data and current day data
    if (selectedStock) {
      // Update ref used by the interval timer
      selectedStockRef.current = selectedStock;
      setSelectedStockCurrent(selectedStock);
      
      // Fetch new data for the selected stock
      fetchHistoricalData();
      getCurrentDayData(selectedStock.exchangeSymbol);
    }
  };

  function getPercentageColor(value) {
    if (value < 0) return 'red';
    if (value === 0) return 'blue';
    return 'green';
  }

  const columns = [
    {
      field: "price_date",
      headerName: "Date",
      width: 100,
      type: "date",
      valueGetter: (params) => (params.value ? new Date(params.value) : null),
      valueFormatter: (params) => (params.value ? params.value.toLocaleDateString() : "N/A"),
    },
    { field: "previous_close_price", headerName: "Prev Close", width: 100, type: "number" },
    { field: "close_price", headerName: "Last Price", width: 100, type: "number" },
    {
      field: "change",
      headerName: "Change",
      width: 100,
      type: "number",
      renderCell: (params) => (
        <span style={{ color: params.value > 0 ? "green" : params.value < 0 ? "red" : "blue", fontWeight: "bold" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "percent_change",
      headerName: " % Change",
      width: 100,
      type: "number",
      renderCell: (params) => (
        <span style={{ color: params.value > 0 ? "green" : params.value < 0 ? "red" : "blue", fontWeight: "bold" }}>
          {params.value}%
        </span>
      ),
    },
    { field: "open_price", headerName: "Open Price", width: 100, type: "number" },
    {
      field: "open price",
      headerName: "Open Price %",
      width: 100,
      type: "number",
      valueGetter: (params) => {
        const openPrice = params.row.open_price;
        const closePrice = params.row.previous_close_price;
        return closePrice ? ((openPrice - closePrice) / closePrice) * 100 : 0;
      },
      renderCell: (params) => (
        <span style={{ color: params.value > 0 ? "green" : params.value < 0 ? "red" : "blue", fontWeight: "bold" }}>
          {params.value.toFixed(2)}%
        </span>
      ),
    },
    { field: "high_price", headerName: "High Price", width: 100, type: "number" },
    {
      field: "intra_day_high",
      headerName: "Intra-day High %",
      width: 150,
      type: "number",
      align: "center",
      valueGetter: (params) => {
        const highPrice = params.row.high_price;
        const closePrice = params.row.previous_close_price;
        return closePrice ? ((highPrice - closePrice) / closePrice) * 100 : 0;
      },
      renderCell: (params) => (
        <span style={{ color: params.value > 0 ? "green" : params.value < 0 ? "red" : "blue", fontWeight: "bold" }}>
          {params.value.toFixed(2)}%
        </span>
      ),
    },
    { field: "low_price", headerName: "Low Price", width: 100, type: "number" },
    {
      field: "intra_day_low",
      headerName: "Intra-day Low %",
      width: 150,
      align: 'center',
      type: "number",
      valueGetter: (params) => {
        const lowPrice = params.row.low_price;
        const closePrice = params.row.previous_close_price;
        return closePrice ? ((lowPrice - closePrice) / closePrice) * 100 : 0;
      },
      renderCell: (params) => (
        <span style={{ color: params.value > 0 ? "green" : params.value < 0 ? "red" : "blue", fontWeight: "bold" }}>
          {params.value.toFixed(2)}%
        </span>
      ),
    },
    { field: "traded_quantity", headerName: "Vol", align: 'center', width: 100, type: "number" },
    { field: "avg_30_vol", headerName: "30-Day Avg Vol", width: 150, type: "number" },
    { field: "avg_50_price", headerName: "50-DMA", width: 150, type: "number" },
    { field: "avg_100_price", headerName: "100-DMA", width: 150, type: "number" },
    { field: "avg_200_price", headerName: "200-DMA", width: 150, type: "number" },
  ];
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar color="default" className="app-bar">
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Tooltip title="Go to Home">
              <Link to="/interested">
                <img src="../../images/logo.png" alt="NDTVPROFIT" />
              </Link>
            </Tooltip>
          </Grid>
          <Grid item>
            <Typography variant="h5">
              <strong>HLC</strong>
            </Typography>
          </Grid>
          <Grid item>
            <Tooltip title="Go to Home">
              <Link to="/interested">
                <HomeIcon />
              </Link>
            </Tooltip>
          </Grid>
        </Grid>
      </AppBar>

      <Box mt={8} mx={2}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box display="flex" alignItems="center" gap={2} mb={2}>

   
  {/* Exchange Select */}

  
    <Select
      value={selectedExchange}
      onChange={handleExchangeChange}
      label="Exchange"
      sx={{width:'200px',
        marginRight:'5px'
      }}
    >
      <MenuItem value={1}>NSE</MenuItem>
      <MenuItem value={2}>BSE</MenuItem>
    </Select>

 
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              InputLabelProps={{ shrink: true }}
              sx={{ width: "200px" }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              InputLabelProps={{ shrink: true }}
              sx={{ width: "200px" }}
            />
            <Autocomplete
              options={filteredData}
              getOptionLabel={(option) => option.exchangeSymbol || ""}
              value={selectedStock}
              inputValue={searchQuery}
              onInputChange={handleSearchChange}
              onChange={handleOptionChange}
              sx={{ width: "300px" }}
              renderInput={(params) => <TextField {...params} label="Search for a stock" fullWidth />}
              PaperComponent={(props) => <Paper {...props} elevation={3} />}
              blurOnSelect
              selectOnFocus
              handleHomeEndKeys
            />
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!startDate || !endDate || !selectedStock}>
              Submit
            </Button>
          </Box>

          <Typography sx={{fontWeight:'bold', fontSize:'30px', display:"flex", justifyContent:"flex-start"}} >{name}</Typography>

          <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer 
              component={Paper} 
              sx={{ 
                maxWidth: 1200,
                margin: '0 auto',
                boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                marginBottom:'10px'
              }}
            >
              <Table 
                aria-label="market data table"
                sx={{
                  minWidth: 800,
                  '& .MuiTableCell-root': {
                    padding: '12px 16px',
                    fontSize: '0.875rem'
                  }
                }}
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Prev Close</TableCell>
                    <TableCell sx={{ fontWeight: '800' }}>Last Price</TableCell> 
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Change</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Change %</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Open Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Open Price %</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>High Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Intra-Day High %</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Low Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Intra-Day Low %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow
                    key={currentDayData?.exchangeSymbol}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
                    }}
                  >
                    <TableCell align="right">
                      {currentDayData?.prevClose || 'N/A'}
                    </TableCell>
                    <TableCell component="th" scope="row" sx={{ fontWeight: '500' }}>
                      {currentDayData?.lastPrice || 'N/A'}
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{
                        color: currentDayData?.change >= 0 ? 'green' : 'red',
                        fontWeight: '500'
                      }}
                    >
                      {currentDayData?.change
                        ? currentDayData?.change.toFixed(2)
                        : 'N/A'}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: ((currentDayData?.lastPrice - currentDayData?.prevClose) / currentDayData?.prevClose) * 100 >= 0 
                          ? 'green' 
                          : 'red',
                        fontWeight: '500'
                      }}
                    >
                      {currentDayData?.lastPrice && currentDayData?.prevClose
                        ? `${(
                            ((currentDayData?.lastPrice - currentDayData?.prevClose) / currentDayData?.prevClose) * 100
                          ).toFixed(2)}%`
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {currentDayData?.open || 'N/A'}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: getPercentageColor(
                          ((currentDayData?.open - currentDayData?.prevClose) / currentDayData?.prevClose) * 100
                        ),
                        fontWeight: '500'
                      }}
                    >
                      {currentDayData?.open && currentDayData?.prevClose
                        ? `${(
                            ((currentDayData?.open - currentDayData?.prevClose) / currentDayData?.prevClose) * 100
                          ).toFixed(2)}%`
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {currentDayData?.high || 'N/A'}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: getPercentageColor(
                          ((currentDayData?.high - currentDayData?.prevClose) / currentDayData?.prevClose) * 100
                        ),
                        fontWeight: '500'
                      }}
                    >
                      {currentDayData?.high && currentDayData?.prevClose
                        ? `${(
                            ((currentDayData?.high - currentDayData?.prevClose) / currentDayData?.prevClose) * 100
                          ).toFixed(2)}%`
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {currentDayData?.low || 'N/A'}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: getPercentageColor(
                          ((currentDayData?.low - currentDayData?.prevClose) / currentDayData?.prevClose) * 100
                        ),
                        fontWeight: '500'
                      }}
                    >
                      {currentDayData?.low && currentDayData?.prevClose
                        ? `${(
                            ((currentDayData?.low - currentDayData?.prevClose) / currentDayData?.prevClose) * 100
                          ).toFixed(2)}%`
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box
            sx={{
              height: 590,
              width: "90%",
              "& .super-app-theme--header": {
                backgroundColor: "#1E88E5",
                color: "white",
                fontWeight: "bold",
                fontSize: "14px",
                textTransform: "uppercase",
              },
              "& .MuiDataGrid-cell": {
                textAlign: "center",
                fontSize: "14px",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#1976D2",
                color: "white",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "#F5F5F5",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#E3F2FD !important",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: "#E3F2FD",
              },
            }}
          >
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <CircularProgress />
              </Box>
            ) : (
              <DataGrid
                rows={historicalData}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                sx={{
                  "& .header-text": {
                    fontSize: "100px",
                    fontWeight: "bold",
                  },
                  "& .MuiDataGrid-toolbarContainer": {
                    backgroundColor: "#E3F2FD",
                  },
                  boxShadow: 3,
                  borderRadius: "10px",
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HLC;