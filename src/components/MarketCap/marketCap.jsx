import React, { useState, useEffect } from 'react';
import HomeIcon from "@mui/icons-material/Home";
import { AppBar, Box, Grid, Tooltip, Typography, TextField, Button, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import { apiConfig } from "commonApi/apiConfig";
import ReactApexChart from 'react-apexcharts';
import html2canvas from "html2canvas";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Columns } from './data';
import CircularProgress from '@mui/material/CircularProgress';
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";

const Marketcap = () => {
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  
  const [date, setDate] = useState("1D");
  const [currentDate, SetCurrentDate] = useState('1D');
  const [marketCapData, setMarketCapData] = useState([]);
  const navigate = useNavigate();
  const [max, setMax] = useState(null);
  const [min, setMin] = useState(null);

const[previousDate, setPreviousDate]  = useState(() => { 
  const currentDate = new Date();
currentDate.setDate(currentDate.getDate() -1 ); // Subtract one day
return currentDate.toISOString().split("T")[0];}
);
const [tabledate, settabledate] =  useState('1D');
  const [selectedCap, setSelectedCap] = useState('all');
  const [tableData, setTabledata] = useState([]);
  const [header, setHeader] = useState("");
  const [subHeader, setSubHeader] = useState("");
  const [headerVisible, setHeaderVisible] = useState(true);
  const [subHeaderVisible, setSubHeaderVisible] = useState(true);
  const [selectedDuration, setselectedDuration]=useState()
  const [selectedDurationTable, setselectedDurationTable]=useState()
  const [selectedChartDurationTable, setselectedChartDurationTable]=useState()
  const dayOfWeek = new Date(date).getDay();
  const dayOfWeektable = new Date(tabledate ).getDay();


  // useEffect(() => {
  //   const currentTime = new Date();
  //   const marketOpenTime = new Date();
  //   const marketCloseTime = new Date();
  //   marketOpenTime.setHours(11, 0, 0, 0);
  //   marketCloseTime.setHours(0, 0, 0, 0); // Midnight

  //   const beforeMarketOpen = currentTime.getHours() < 9; // Check if before 9 AM
  //   const isWeekday = currentTime.getDay() >= 1 && currentTime.getDay() <= 5;

  //   if (isWeekday) {
  //     if (currentTime < marketOpenTime || currentTime > marketCloseTime) {
  //       console.log("outside market hours or before 9 AM");
  //       setDate(previousDate);
  //     } else {
  //       setDate('1D');
  //     }
  //   } else {
  //     // Weekend handling:
  //     console.log("It's the weekend!");
  //     setDate(previousDate); // Or a specific weekend logic
  //   }
  // }, []);


  



  let totalCurrMarketCap = 0;
  let totalPrevMarketCap = 0;
  let totalChange = 0;
  
  tableData.forEach(data => {
    totalCurrMarketCap += data.currentMarketCap;
    totalPrevMarketCap += data.previousMarketCap;  
    // Calculate change as the difference between current and previous market cap
    let change = data.currentMarketCap - data.previousMarketCap;
    totalChange += change;
  });
  

  

  // Function to capture and download the screenshot
  const downloadSnapshot = () => {
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      alert("Market Holiday");
    } else {
      const gridElement = document.getElementById("charts-grid");
      html2canvas(gridElement).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "marketcap_dashboard.png";
        link.click();
      });
    }
  };



  // Fetch market cap data
  const fetchMarketCapData = async (selectedDate) => {
    try {
      const response = await apiConfig(
        `getBarGraphMarketCap?date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMarketCapData(response);
      calculateTotalAbsoluteChange(response);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
    }
  };

  const fetchTableMarketCapData = async () => {

    
    try {
      const response = await apiConfig(
        `getMarketCapListCategory?date=${tabledate}&Category=${selectedCap}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTabledata(response);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
    }
  };





  useEffect(() => {
    if (token) {
      fetchMarketCapData(date);
    }
  }, [token, selectedChartDurationTable]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (token) fetchMarketCapData(date);
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [token, date]);


  useEffect(() => {
    let intervalId;

    if (token) {
      fetchTableMarketCapData(); // Initial fetch

      intervalId = setInterval(fetchTableMarketCapData, 40000); // Set interval

    }

    return () => {
      clearInterval(intervalId); // Clear interval on unmount or token change
    };
  }, [token, tabledate, selectedCap]);


  // Handle date change
  const handleDateChange = (event) => {
    const selectedDate = event.target.value;
    setDate(selectedDate);
    fetchMarketCapData(selectedDate);
  };

  // Handle table date change
  const handleTableDateChange = (event) => {
    const selectedDate = event.target.value;
    settabledate(selectedDate);
  };
  //akshay

  // Color palette for consistent colors across both charts
  const chartColors = ['#1f77b4', '#ff7f0e', '#8F00FF', '#ffa500'];

  // Calculate total absolute change in market cap
  const calculateTotalAbsoluteChange = (data) => {
    const total = data.reduce((acc, item) => acc + Math.abs(item.change_in_market_cap_cr), 0);
    const roundedTotal = Math.round(total); // Round to the nearest integer
    setMax(parseInt(roundedTotal, 10)); // Ensure it's an integer
    setMin(parseInt(-roundedTotal, 10)); // Ensure it's an integer
    
  };



 
  // Total of all caps
  const totalMarketCap = marketCapData.reduce(
    (total, item) => total + (item.current_market_cap_cr || 0),
    0
  );

  const formatMarketCap = (marketCap) => {
    return marketCap ? marketCap.toFixed(2) : "0.00";
  };

  // Pie chart configuration
  const pieChartOptions = {
    chart: {
      type: "pie",
    },
    title: {
      text: `Current Market Cap (Rs ${(totalMarketCap).toFixed(2)} CR) `,
      align: "left",
      style: {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#333'
      },
    },
    colors: chartColors,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    labels: ["LargeCap", "MidCap", "SmallCap", "MicroCap"],
    tooltip: {
      y: {
        formatter: (value, { seriesIndex }) => {
          const cap = marketCapData[seriesIndex]?.current_market_cap_cr || 0;
          return `${formatMarketCap(cap)} CR`;
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value, { seriesIndex }) => {
        const cap = marketCapData[seriesIndex]?.current_market_cap_cr || 0;
        return `${formatMarketCap(cap)} `;
      },
      style: {
        fontSize: '13px',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        colors: ['#fff'],
      },
    },
    legend: {
      fontSize: '20px', // Increase the size of legend labels (LargeCap, MidCap, etc.)
      fontFamily: 'Arial, sans-serif',
      position: 'bottom',
      markers: {
        width: 20,
        height: 20,
      },
    }
  };

  const pieChartSeries = marketCapData.length > 0
    ? marketCapData.map((item) => item.current_market_cap_cr || 0)
    : [1, 1, 1, 1];

  // Bar chart options
  const totalMarketCapChange = marketCapData.reduce((sum, item) => sum + item.change_in_market_cap_cr, 0);

 const barChartOptions = {
  chart: {
    type: 'bar',
  },
  plotOptions: {
    bar: {
      distributed: true,
      dataLabels: {
        position: 'top',
      },
    },
  },
  title: {
    text: `Change in Market Cap (Rs ${(totalMarketCapChange).toFixed(2)} CR)`,
    align: 'left',
    style: {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#333',
    },
  },
  colors: chartColors,
  xaxis: {
    categories: ['LargeCap', 'MidCap', 'SmallCap', 'MicroCap'],
    labels: {
      style: {
        fontSize: '18px', // Increase size of x-axis labels
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
      },
    },
  },
  yaxis: {
    min: min || -100,
    max: max || 100,
    tickAmount: 10,
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          position: 'bottom',
        },
      },
    },
  ],
  dataLabels: {
    enabled: true,
    style: {
      fontSize:'13px',
      colors: marketCapData.map((item) =>
        item.change_in_market_cap_cr >= 0 ? '#2ecc71' : '#e74c3c'
      ),
    },
    formatter: (value) => `${value} CR`,
    offsetY: -18,
  },
  tooltip: {
    enabled: true,
    y: {
      formatter: (value) => `${value} CR`,
    },
  },
  legend: {
    fontSize: '18px', // Add legend font size 
    fontFamily: 'Arial, sans-serif',
  },
};
  
  const barChartSeries = [
    {
      name: 'MarketCap',
      data: marketCapData.length > 0 ? marketCapData.map((item) => item.change_in_market_cap_cr) : [0, 0, 0, 0],
    },
  ];
  
  // Handle category change
  const handleExchangeChange = (event) => {
    setSelectedCap(event.target.value);
  };

  const headerHandleInputChange = (e) => {
    setHeader(e.target.value);
};

const headerHandleInputBlur = () => {
    setHeaderVisible(false);
};

const subHeaderHandleInputChange = (e) => {
    setSubHeader(e.target.value);
};

const subHeaderHandleInputBlur = () => {
    setSubHeaderVisible(false);
};

const handleDurationChange = (event) => {
  setselectedChartDurationTable(event.target.value);
  if(event.target.value === 10){
    setDate(previousDate)
   }else if(event.target.value === '1D'){
    setDate('1D')
    
   }
   else{
     setDate(event.target.value)
   }

};

const handleDurationTableChange = (event) => {

  setselectedDurationTable(event.target.value);
  if(event.target.value === 10){
   settabledate(previousDate)
  }else if(event.target.value === '1D'){
   settabledate('1D')
   
  }
  else{
    settabledate(event.target.value)
  }
 
};
const formatDate = (date) => {
   console.log('dateaaa' , typeof(date), date)
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0'); // Ensures two-digit day
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Ensures two-digit month
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};
  return (
    <>
      {/* Header */}
      <header>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" color="default" className="app-bar">
            <Grid container alignItems="center" justifyContent="space-between" sx={{ px: 2 }}>
              {/* Logo Section */}
              <Grid item>
                <Tooltip title="Go to Home">
                  <Link to="/interested">
                    <img
                      src="../../images/logo.png"
                      alt="NDTVPROFIT"
                      style={{ height: "40px" }}
                    />
                  </Link>
                </Tooltip>
              </Grid>

              {/* Title Section */}
              <Grid item>
                <Typography variant="h5" className="announcements-title">
                  <strong>NSE MARKETCAP DASHBOARD</strong>
                </Typography>
              </Grid>

              {/* Home Icon Section */}
              <Grid item>
                <Tooltip title="Go to Home">
                  <Link to="/interested">
                    <HomeIcon />
                  </Link>
                </Tooltip>
              </Grid>
            </Grid>
          </AppBar>
        </Box>
      </header>

      {/* Date Picker */}
      <Box sx={{ mt: 4, px: 4, display: 'flex', justifyContent:'space-between',alignItems:'center' }}>

        <Box sx={{display:'flex'}}>
        <Box>
      {/* Exchange Select */}
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel>Duration</InputLabel>
        <Select
    value={selectedChartDurationTable === undefined ? '1D' : selectedChartDurationTable}
    onChange={handleDurationChange}
    label="Duration"
    sx={{ width: '200px', marginRight: '5px' }}
>
    <MenuItem value={'1D'}>1D</MenuItem>
    <MenuItem value={'1W'}>1W</MenuItem>
    <MenuItem value={'TW'}>This Week</MenuItem>
    <MenuItem value={'1M'}>1M</MenuItem>
    <MenuItem value={'TM'}>This Month</MenuItem>
    <MenuItem value={'3M'}>3M</MenuItem>
    <MenuItem value={'6M'}>6M</MenuItem>
    <MenuItem value={10}>Date to Date</MenuItem>
</Select>

      </FormControl>


    
    </Box>
      {/* Show TextField only if "Date to Date" is selected */}
      {selectedChartDurationTable === 10 && (
        <TextField
          label="Since Date"
          type="date"
          value={date}
          onChange={handleDateChange}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ width: '200px', marginTop: '15px' }}
        />
      )}
        </Box>


        <Button variant="contained" color="primary" onClick={downloadSnapshot}>
          Download
        </Button>
      </Box>
      <Grid sx={{ color: 'red', display: 'flex', justifyContent: 'center', fontSize: '20px' }}>


   {selectedChartDurationTable === 10 ? (
    `Since Date ${formatDate(date)}`
  ) : (
    `Since ${date} ` 
  )}
</Grid>

      {/* Charts Section */}
      <Box sx={{ mt: 4, px: 4 }}>
       
   



        {/* Conditionally render "Market Closed" */}
  
          <Grid container spacing={4} sx={{ mt: 6, px: 4 }} id="charts-grid">

<div className="input-container-one">
                            {headerVisible ? (
                                <input
                                    className="input-fields"
                                    type="text"
                                    id="user-input"
                                    value={header}
                                    onChange={headerHandleInputChange}
                                    onBlur={headerHandleInputBlur}
                                    placeholder="Header..."
                                />
                            ) : (
                                <p className="headers">
                                    <strong>{header}</strong>
                                </p>
                            )}
                        </div>

                        <div className="input-container-two">
                            {subHeaderVisible ? (
                                <input
                                    className="input-fields"
                                    type="text"
                                    id="user-input"
                                    value={subHeader}
                                    onChange={subHeaderHandleInputChange}
                                    onBlur={subHeaderHandleInputBlur}
                                    placeholder="SubHeader..."
                                />
                            ) : (
                                <p className="subheaders">{subHeader}</p>
                            )}
                        </div>
            {/* PieChart */}
            <Grid item xs={12} md={6}>
              <ReactApexChart
                options={pieChartOptions}
                series={pieChartSeries}
                type="pie"
                width={600}
                height={500}
              />
            </Grid>

            {/* BarChart */}
            <Grid item xs={12} md={6}>
              <ReactApexChart
                options={barChartOptions}
                series={barChartSeries}
                type="bar"
                width={700}
                height={500}
              />
            </Grid>
          </Grid>
     
      </Box>

      {/* Horizontal Line */}
      <Divider sx={{ my: 4 }} />

      <Box>
        <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {/* Duration */}
               <Grid>
          <Box>
      {/* Exchange Select */}
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel>Duration</InputLabel>
        <Select
          value={selectedDurationTable === undefined ? '1D' : selectedDurationTable}
          onChange={handleDurationTableChange}
          label="Duration"
          sx={{ width: '200px', marginRight: '5px' }}
        >
          <MenuItem value={'1D'}>1D</MenuItem>
          <MenuItem value={'1W'}>1W</MenuItem>
          <MenuItem value={'TW'}>This Week</MenuItem>
          <MenuItem value={'1M'}>1M</MenuItem>
          <MenuItem value={'TM'}>This Month</MenuItem>
          <MenuItem value={'3M'}>3M</MenuItem>
          <MenuItem value={'6M'}>6M</MenuItem>
          <MenuItem value={10}>Date to Date</MenuItem>
        </Select>
      </FormControl>
    </Box>
          </Grid>
          <Grid sx={{ marginTop: '7px' }}>


  {/* Show TextField only if "Date to Date" is selected */}
  {selectedDurationTable === 10  && (
          <TextField
          label="Since Date"
          type="date"
          value={tabledate}
          onChange={handleTableDateChange}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ width: "200px" }}
        />
      )}














       
          </Grid>


          {/* Category */}
          <Grid sx={{ marginLeft: '10px' }}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCap}
                onChange={handleExchangeChange}
                label="Exchange"
                sx={{
                  width: '200px',
                }}
              >
                <MenuItem value={'all'}>All</MenuItem>
                <MenuItem value={'largecap'}>Large Cap</MenuItem>
                <MenuItem value={'midcap'}>Mid Cap</MenuItem>
                <MenuItem value={'smallcap'}>Small Cap</MenuItem>
                <MenuItem value={'microcap'}>Micro Cap</MenuItem>
              </Select>
            </FormControl>
          </Grid>

     
        </Grid>

        <Grid sx={{ color: 'red', display: 'flex', justifyContent: 'center', fontSize: '20px' }}>
  {selectedDurationTable === 10 ? (
    `Avg 6M Mcap Date ${formatDate(tabledate)}`
  ) : (
    `Avg ${tabledate} Mcap  ` 
  )}
</Grid>



  <Box sx={{ height: '800px', width: '100%' }}>
    {tableData.length > 0 ? (
      <DataGrid
        rows={tableData.map((item, index) => ({
          id: index,
          ...item,
          marketCapChange: item.previousMarketCap && item.currentMarketCap
            ? item.currentMarketCap - item.previousMarketCap
            : 0,
        }))}
        columns={Columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        components={{
          Toolbar: GridToolbar,
        }}
        disableSelectionOnClick
        sx={{
          '& .MuiDataGrid-root': {
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
          },
          '& .MuiDataGrid-cell': {
            textAlign: 'center',
            fontSize: '14px',
          },
          '& .MuiDataGrid-columnHeader': {
            fontWeight: 'bold',
            backgroundColor: '#1976d2', // Blue header background
            color: '#fff', // White text
          },
          '& .MuiDataGrid-columnHeader:hover': {
            backgroundColor: '#1565c0', // Slightly darker blue on hover
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: '#f9f9f9',
          },
        }}
      />
    ) : (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Grid sx={{ display: 'flex', justifyContent: 'center', color: 'red', fontSize: '30px' }}>
    <CircularProgress/>
        </Grid>
      </Box>
    )}
  </Box>

      </Box>
    </>
  );
};

export default Marketcap;