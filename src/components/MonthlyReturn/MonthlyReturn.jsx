import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Grid,
  Tooltip,
  Typography,
  TextField,
  MenuItem,
  Select,
  List, ListItem, ListItemText, Paper, Divider , Autocomplete, FormControl, InputLabel,
} from "@mui/material";

import { Link, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import Cookies from "js-cookie";
import { apiConfig, apiConfigPostChange, ws } from "../../commonApi/apiConfig";
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import "./monthlyReturn.css";


const MonthlyReturn = () => {
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  const [selectedType, setSelectedType] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const[data, setData] = useState([]);
    
  const navigate = useNavigate();
  const [response, setResponse] = useState([]); // Stock data from API
  const [searchQuery, setSearchQuery] = useState(''); // Input value for the search
  const [selectedOption, setSelectedOption] = useState("NIFTY 50") // Selected stock option
  const [selectedExchange, setSelectedExchange] = useState(1); // Default to NSE (1)
  const [filteredData, setFilteredData] = useState([]); // Filtered stock data based on exchange

console.log('filteredData', filteredData)

   
  useEffect(() => {
    const tokenFromCookies = Cookies.get("token");
    if (tokenFromCookies) {
      setToken(tokenFromCookies);
     
    } else {
      navigate("/");
    }
  }, [navigate]);

// Fetch the stock data
  const getStocks = async () => {
    try {
      const response = await apiConfig(
        `searchStocks?exchangeId=${selectedExchange}&text=${searchQuery}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Set the response data into the state
      if (response) {
        setResponse(response);
      } else {
        setResponse([]); // Fallback to an empty array if no data is found
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

    const getStocksMonthlyReturn = async () => {
    try {
      const response = await apiConfig(
        `monthlyreturns?exchangeSymbol=${selectedOption}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Set the response data into the state
      if (response) {
        setData(response);
      } else {
        setData([]); // Fallback to an empty array if no data is found
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  useEffect(() => {
    if (Array.isArray(response)) {
      const filtered = response.filter(item => item.exchangeId === selectedExchange);
      setFilteredData(filtered);
    } else {
      console.error("Response is not an array", response);
      setFilteredData([]); // Reset filtered data if the response isn't valid
    }
  }, [selectedExchange, response]); // Re-run when selectedExchange or response changes
  


  
  // Handle exchange selection change
  const handleExchangeChange = (event) => {
    setSelectedExchange(event.target.value);
  };
  
  // Handle search input change
  const handleSearchChange = (event, newInputValue) => {
    setSearchQuery(newInputValue); // Update with the current typed input
  };
  
  // Handle the option change in autocomplete
  const handleOptionChange = (event, newValue) => {
    console.log("newvalue",newValue )
    if (newValue) {
      setSelectedOption(newValue.exchangeSymbol); // Set the full stock object
      setSearchQuery(newValue.name); // Set the name as the search query
    } else {
      setSelectedOption(""); // Clear selected option
      setSearchQuery(''); // Clear the search input
    }
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      getStocks();
    }
  }, [searchQuery]);


  useEffect(() => {
    // Immediately call the function when the dependency changes
    getStocksMonthlyReturn();
  
    // Set up the interval to call the function every 4 seconds
    const interval = setInterval(() => {
      getStocksMonthlyReturn();
    }, 4000);
  
    // Cleanup the interval when the component unmounts or dependencies change
    return () => clearInterval(interval);
  }, [selectedOption, token]); // Dependencies
  


  

  const getDataWithMonthlyAndAverage = (option) => {
   
  
  
    const filteredData = Object.keys(data)
      .filter(year => data[year]?.exchangeSymbol === option)  // Safe access to data[year]
      .map(year => {
        const selectedData = data[year];
        const monthlyData = Object.entries(selectedData.months || {}).map(([month, value]) => ({
          month,
          percentChange: parseFloat(value) || 0,
        }));
  
        // Calculate yearly average percentage change
        const yearlyAverage = monthlyData.reduce((acc, val) => acc + val.percentChange, 0) / monthlyData.length || 0;
  
        return { year, monthlyData, average: yearlyAverage };
      })
      .sort((a, b) => b.year - a.year); // Sort years in descending order
  
    // Handle monthly averages
    const months = filteredData[0]?.monthlyData?.map(item => item.month) || [];
    const monthlyAverages = months.map(month => {
      const total = filteredData.reduce((acc, yearData) => {
        const monthData = yearData.monthlyData.find(data => data.month === month);
        return acc + (monthData ? monthData.percentChange : 0);
      }, 0);
      return {
        month,
        percentChange: (total / filteredData.length) || 0,
      };
    });
  
    if (filteredData.length > 0) {
      return [{ year: 'Summary', monthlyData: monthlyAverages, average: monthlyAverages.reduce((acc, val) => acc + val.percentChange, 0) / monthlyAverages.length }, ...filteredData];
    }
  
    console.error("Data for the selected exchange symbol is not available");
    return [];
  };
  
  const renderCards = (cardData) => {
    const currentYear = new Date().getFullYear().toString();
  
    if (!Array.isArray(cardData) || cardData.length === 0) {
      return (
        <Typography>
          <Box sx={{ width: '100%' }}>
       
          </Box>
        </Typography>
      );
    }
  
    // Separate out the current year data and exclude years as needed
    const   currentYearCard = cardData.find(card => card.year === currentYear);
    const filteredYears = cardData
      .filter(card => card.year !== currentYear && card.year !== 'Summary')
      .sort((a, b) => b.year - a.year); // Sort by descending order
      console.log('filteredYears', filteredYears)
  
    // Select the most recent 10 years from the sorted list
    const yearsForAverage = filteredYears.slice(0, 10);
  
    // Calculate the 10-year average percent change per month
    const monthlyAverages = Array(12).fill(0).map((_, monthIndex) => {
      const monthlyPercentChanges = yearsForAverage.map(card => card.monthlyData[monthIndex].percentChange);
      return monthlyPercentChanges.reduce((sum, change) => sum + change, 0) / monthlyPercentChanges.length;
    });
  
    // Prepare a summary card data structure with the calculated averages
    const summaryCard = {
      year: 'Summary',
      monthlyData: monthlyAverages.map((avg, index) => ({
        month: yearsForAverage[0].monthlyData[index].month, // Use the month names from original data
        percentChange: avg
      }))
    };
  
    // Render the current year card, other years, and summary card
    const renderCardRow = (card, isSummary) => (
      <Box
        
        key={`${card.year}`}
        sx={{
           Width:"100% ",
          mb: 2,
          display: "flex",
          flexDirection: isSummary ? "column" : "row",
          justifyContent: 'center',
          flexWrap: "nowrap",
          backgroundColor: isSummary ? 'rgba(0, 150, 136, 0.1)' : 'inherit',
          borderRadius: isSummary ? 2 : 1,
          boxShadow: isSummary ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none',
          padding: isSummary ? 2 : 0,
          ...(isSummary && { marginLeft: '53px' }),
        }}
      >
        <Typography
          variant="h7"
          sx={{
            mb: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginRight: "10px",
            fontSize: "22px",
            
          }}
        >
          {isSummary ? "(10 Year Monthly Average)" : card.year}
        </Typography>
  
        <Grid
          container
          spacing={0.2}
          sx={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", justifyContent: 'center' }}
        >
          {card.monthlyData.map(data => {
            const isPositive = data.percentChange > 0;
            const isNegative = data.percentChange < 0;
            const bgColor = isPositive
              ? `rgb(0, ${(100 * Math.max(...card.monthlyData.map(d => d.percentChange))) / data.percentChange}, 0)`
              : isNegative
              ? `rgb(${70 + (255 - 70) * (1 - Math.abs(data.percentChange) / Math.abs(Math.min(...card.monthlyData.map(d => d.percentChange))))}, 0, 0)`
              : `rgb(255,255,255)`;
  
            return (
              <Grid
                item
                xs={0}
                key={data.month}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: bgColor,
                    color: data.percentChange === 0 ? "black" : "white",
                    p: 2,
                    textAlign: "center",
                    borderRadius: 1,
                    width: "120px",
                    border: "1px solid grey",
                    boxShadow: '1px 2px 2px grey',
                    fontWeight: '900'
                  }}
                >
                  <Typography variant="body1">{data.month}</Typography>
                  <Typography variant="body2" sx={{ fontSize: '20px' }}>
                    {`${data.percentChange.toFixed(2)}%`}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  
    return (
      <>
        {currentYearCard && renderCardRow(currentYearCard, false)}
        {renderCardRow(summaryCard, true)}
        {filteredYears.map(card => renderCardRow(card, false))}
      </>
    );
  };
  

  const seriesData = selectedOption ? getDataWithMonthlyAndAverage(selectedOption) : [];


  return (
    <Box sx={{ flexGrow: 1 }}>

      {/* HEADER  */}
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
            <Typography variant="h5" className="announcements-title">
              <strong>Monthly Returns</strong>
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

     <Box sx={{ display: "flex", flexDirection: "row",justifyContent:"center", alignItems: "center" }}>
<Box>
  {/* Exchange Select */}
  <FormControl fullWidth variant="outlined" margin="normal">
    <InputLabel>Exchange</InputLabel>
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
  </FormControl>
  </Box>

  <Box>
  {/* Autocomplete Search */}
 <Autocomplete
      id="stock-search"
      options={filteredData} // Use filtered data based on the selected exchange
      getOptionLabel={(option) => option.exchangeSymbol || ''} // Display stock name and symbol
      value={selectedOption} // Controlled by selectedOption state
      inputValue={searchQuery} // Controlled by searchQuery state
      onInputChange={handleSearchChange} // Handle search query input
      onChange={handleOptionChange} // Handle option selection
      sx={{ width: '300px' }}
      isOptionEqualToValue={(option, value) => option.id === value?.id} // Compare based on option.id
      filterOptions={(options, state) => {
        const inputValue = state.inputValue || '';
        const filtered = options.filter(option =>
          option.name && option.name.toLowerCase().includes(inputValue.toLowerCase())
        
        );

        // Handle "No results found" and "Start typing" messages
        if (filtered.length === 0 && inputValue !== '') {
          return [{ id: 'no-results', name: 'No results found' }];
        } else if (inputValue === '') {
          return [{ id: 'start-typing', name: 'Start typing to search for stocks...' }];
        }

        return filtered;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search for a stock"
          variant="outlined"
          fullWidth
          margin="normal"
        />
      )}
      renderOption={(props, option) => {
        // Handle different cases (No results, Start typing, or regular options)
        if (option.id === 'no-results') {
          return (
            <li {...props} key={option.id}>
              <Typography variant="body2" color="textSecondary">
                <Box sx={{ display: 'flex' }}>
                  <CircularProgress size={24} />
                </Box>
              </Typography>
            </li>
          );
        } else if (option.id === 'start-typing') {
          return (
            <li {...props} key={option.id}>
              <Typography variant="body2" color="textSecondary">
                {option.name}
              </Typography>
            </li>
          );
        } else {
          return (
            <li {...props} key={option.id}>
              <Typography variant="body2">{`${option.name} - ${option.exchangeSymbol}`}</Typography>
            </li>
          );
        }
      }}
      PaperComponent={(props) => <Paper {...props} elevation={3} />}
    />

</Box>
    </Box>


        <Box>
        <Typography variant="h4" align="center" sx={{display:"flex",justifyContent:"flex-start",marginBottom:"5px", fontWeight:''}}>
        {selectedOption}
          </Typography>
         
          {selectedOption && renderCards(seriesData) }
        </Box>

      </Box>

    </Box>
  );
};

export default MonthlyReturn;
