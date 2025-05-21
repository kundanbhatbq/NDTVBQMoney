import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import html2canvas from "html2canvas";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import { apiConfig, apiConfigNewsFlash, graphConfig } from "../commonApi/apiConfig";
import Cookies from "js-cookie";
import "./chart.scss";
import { Autocomplete, Box, Button, Grid, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import CommonDialog from "./Dialog";
import CircularProgress from "@mui/material/CircularProgress";
import TwoLineMixedChart from "./TwoLineChart";
// import TwoLineMixedChart from "./TwoLineChart";

let tick = false;
let previousClose = "";
let longpreviousClose = "";
let lastApiRequestTime = new Date();
const DEFAULT_SELECTED_YEAR = "Intraday";

const yearAbbreviations = {
  week: "Week",
  thisweek: "This Week",
  month1: "1 Month",
  thismonth: "This Month",
  month6: "6 Month",
  month3: "3 Month",
  month12: "12 Month",
  thisyear: "This Year",
  year5: "5 Year",
  year10: "10 Year",
  dateToDate: "Date To Date"
};

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
const currentDay = currentDate.getDate().toString().padStart(2, '0');
const firstDay = '01';

const initialStartDate = `${currentYear}-${currentMonth}-${firstDay}`;
const initialEndDate = `${currentYear}-${currentMonth}-${currentDay}`;

function ApexChart() {
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  const [email, setEmail] = useState(() => Cookies.get("email") || "");
  const [dataGraph, setDataGraph] = useState([]);
  const [header, setHeader] = useState("");
  const [subHeader, setSubHeader] = useState("");
  const [headerVisible, setHeaderVisible] = useState(true);
  const [subHeaderVisible, setSubHeaderVisible] = useState(true);
  const [selectedYear, setSelectedYear] = useState("Intraday");
  const { id, name, price, prevClose } = useParams();
  const chartRef = useRef(null);
  const selectedYearValue = yearAbbreviations[selectedYear] || "INTRADAY";
  const [openDialog, setOpenDialog] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [loading, setLoading] = useState(false);
  const [twoLineGraph, setTwoLineGraph] = useState(false)
  const [searchInput, setSearchInput] = useState('');
  const [dataFullArr, setDataFullArr] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sensexData, setSensexData] = useState([])
  const [niftyData, setNiftyData] = useState([]);

  console.log('dataGraph', dataGraph.lineData, price)

  const formatValue =
    name === "YGPYGS071833.FIMM" ||
    name === "GPYGS071833.FINN" ||
    name === "INR=OTCFX";


  useEffect(() => {
    const tokenFromCookies = Cookies.get("token");
    if (tokenFromCookies) {
      setToken(tokenFromCookies);
    }
  }, []);


  const currentTime = new Date();
  const marketOpenTime = new Date();
  const marketCloseTime = new Date();
  marketOpenTime.setHours(9, 0, 0, 0);
  marketCloseTime.setHours(15, 35, 0, 0);

  const isWeekday = currentTime.getDay() >= 1 && currentTime.getDay() <= 5;


  const marketHolidays = [
    new Date(currentTime.getFullYear(), 0, 26), // 26-Jan
    new Date(currentTime.getFullYear(), 2, 8),  // 08-Mar
    new Date(currentTime.getFullYear(), 2, 31), // 25-Mar
    new Date(currentTime.getFullYear(), 2, 29), // 29-Mar
    new Date(currentTime.getFullYear(), 3, 14), // 14-Apr   
    new Date(currentTime.getFullYear(), 4, 1),  // 01-May
    new Date(currentTime.getFullYear(), 7, 15), // 15-Aug
    new Date(currentTime.getFullYear(), 7, 27), // 27-Aug
    new Date(currentTime.getFullYear(), 9, 2),  // 02-Oct
    new Date(currentTime.getFullYear(), 9, 21), // 21-Oct
    new Date(currentTime.getFullYear(), 9, 22), // 22-Oct
    new Date(currentTime.getFullYear(), 10, 5), // 05-Nov
    new Date(currentTime.getFullYear(), 11, 25) // 25-Dec
  ];

  useEffect(() => {
    const isMarketHoliday = marketHolidays.some(holiday => {
      return holiday.toDateString() === currentTime.toDateString();
    });

    if (!isMarketHoliday && ((tick && isWeekday) || selectedYearValue !== "INTRADAY")) {
      if ((currentTime >= marketOpenTime && currentTime <= marketCloseTime) || selectedYearValue !== "INTRADAY") {
        const intervalId = setInterval(() => {
          const timeSinceLastRequest = new Date() - lastApiRequestTime;

          if (((tick && timeSinceLastRequest >= 1000) || selectedYearValue !== "INTRADAY") && !twoLineGraph) {
            if (endDate === initialEndDate) {
              getSingleTick(dataGraph);
            }
          }
        }, 3000);

        return () => {
          clearInterval(intervalId);
        };
      }
    }
  }, [name, tick, dataGraph]);


  useEffect(() => {
    if ((searchInput && selectedYear !== DEFAULT_SELECTED_YEAR)) {
      getMultiLongTermGraph(selectedYear, searchInput)
      getMultiLineGraphLt(searchInput)
    } else if (searchInput && selectedYear === "dateToDate") {
      getMultiLongTermGraph(selectedYear, searchInput)
      getMultiLineGraphLt(searchInput)
    }
  }, [selectedYear, startDate, endDate]);

  useEffect(() => {
    if (selectedYear === "dateToDate") {
      getLineGraphLt()
    } else if (selectedYear !== DEFAULT_SELECTED_YEAR) {
      getLongTermGraph(selectedYear);
    } else {
      getLineGraph();
    }
  }, [selectedYear, startDate, endDate]);

  const getAllStocks = useCallback(async (value) => {
    try {
      const response = await apiConfig(`searchStocks?text=${value}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDataFullArr(response);
      setFilters(response);
    } catch (error) {
      console.error(error);
      setFilters([]);
      setDataFullArr([]);
    }
  }, []);



  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedGetAllStocks = useRef(debounce(getAllStocks, 1000)).current;

  useEffect(() => {
    if (searchInput.length >= 3) {
      debouncedGetAllStocks(searchInput);
    } else {
      setFilters([]);
    }
  }, [searchInput]);

  const getLineGraph = async () => {
    const sanitizedValue = name?.replace(/&/g, "%26");
    setLoading(true)
    try {
      const response = await graphConfig(
        `getLineGraph?exchangeSymbol=${sanitizedValue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }

      );
      const stockData = response || [];
      previousClose = prevClose;
      setDataGraph(stockData);
      tick = true;
      setLoading(false)
    } catch (err) {
      console.error(err);
      setDataGraph([]);
      setLoading(false)
      previousClose = "";
      tick = false;
    }
  };

  const getLineGraphLt = async () => {
    const sanitizedValue = name?.replace(/&/g, "%26");
    setLoading(true)
    try {
      const response = await graphConfig(
        `getLineGraphLt?exchangeSymbol=${sanitizedValue}&graphType=${selectedYear}&startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token} `,
          },
        }

      );
      const LongTermGraph = response || [];
      const singleLongTick = LongTermGraph?.lineData || [];
      longpreviousClose =
        singleLongTick?.length > 0 ? singleLongTick[0][1] : "";
      setDataGraph(response);
      setNiftyData(response);
      tick = true;
      setLoading(false)
    } catch (err) {
      console.error(err);
      setDataGraph([]);
      previousClose = "";
      setLoading(false)
    }
  };

  const getMultiLineGraphLt = async (searchInput) => {
    const sanitizedValue = searchInput?.replace(/&/g, "%26");
    setLoading(true)
    try {
      const response = await graphConfig(
        `getLineGraphLt?exchangeSymbol=${sanitizedValue}&graphType=${selectedYear}&startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token} `,
          },
        }

      );
      const LongTermGraph = response || [];
      const singleLongTick = LongTermGraph?.lineData || [];
      longpreviousClose =
        singleLongTick?.length > 0 ? singleLongTick[0][1] : "";
      setSensexData(response);
      tick = true;
      setLoading(false)
    } catch (err) {
      console.error(err);
      setSensexData([]);
      previousClose = "";
      setLoading(false)
    }
  };

  const getSingleTick = async (dataGraph) => {
    const sanitizedValue = name?.replace(/&/g, "%26");
    const ticksParam = tick;
    try {
      const response = await graphConfig(
        `getLineGraph?exchangeSymbol=${sanitizedValue}&ticks=${ticksParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const singleTick = response?.lineData || [];
      const graphData = { ...dataGraph };
      const tickArr = [singleTick[0][0], singleTick[0][1]];
      singleTick && graphData.lineData.push(tickArr);
      previousClose = prevClose;
      setDataGraph(graphData);
    } catch (err) {
      console.error(err);
      setDataGraph([]);
      previousClose = "";
    }
  };

  const getLongTermGraph = async (value) => {
    const sanitizedValue = name?.replace(/&/g, "%26");
    setLoading(true)
    try {
      const response = await graphConfig(
        `getLineGraphLt?exchangeSymbol=${sanitizedValue}&graphType=${value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const LongTermGraph = response || [];
      const singleLongTick = LongTermGraph?.lineData || [];
      longpreviousClose =
        singleLongTick?.length > 0 ? singleLongTick[0][1] : "";
      setDataGraph(response);
      setNiftyData(response);
      setLoading(false)
    } catch (err) {
      console.error(err);
      setDataGraph([]);
      previousClose = "";
      setLoading(false)
    }
  };

  const getMultiLongTermGraph = async (value, searchInput) => {
    const sanitizedValue = searchInput?.replace(/&/g, "%26");
    setLoading(true)
    try {
      const response = await graphConfig(
        `getLineGraphLt?exchangeSymbol=${sanitizedValue}&graphType=${value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const LongTermGraph = response || [];
      const singleLongTick = LongTermGraph?.lineData || [];
      longpreviousClose =
        singleLongTick?.length > 0 ? singleLongTick[0][1] : "";
      setSensexData(response)
      setLoading(false)
    } catch (err) {
      console.error(err);
      setSensexData([]);
      previousClose = "";
      setLoading(false)
    }
  };

  const fetchNiftyData = async () => {
    const sanitizedValue = name?.replace(/&/g, "%26");
    try {
      const response = await graphConfig(
        `getLineGraph?exchangeSymbol=${sanitizedValue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const stockData = response || [];
      setNiftyData(stockData);
    } catch (err) {
      console.error(err);
      setNiftyData([]);
    }
  };

  const fetchSensexData = async () => {
    const symbol = searchInput?.toUpperCase()?.replace(/&/g, "%26");
    try {
      const response = await graphConfig(
        `getLineGraph?exchangeSymbol=${symbol}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const stockData = response || [];
      setSensexData(stockData);
      fetchNiftyData()
    } catch (err) {
      console.error(err);
      setSensexData([]);
    }
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

  const searchStock = (event) => {
    event.preventDefault();
    const enteredText = event.target.value.trim();

    if (event.keyCode === 13 && enteredText.length >= 3) {
      const matchingStock = dataFullArr?.find(
        (stock) =>
          stock.name && `${stock.name.toLowerCase()} | ${stock.exchangeSymbol.toLowerCase()}` === enteredText.toLowerCase()
      );
      if (matchingStock) {
        getAllStocks(enteredText);
      } else {
        const desiredList = dataFullArr?.filter((stock) => {
          return stock.name != null
            ? (stock.exchangeSymbol.toLowerCase().includes(enteredText.toLowerCase()) ||
              stock.name.toLowerCase().includes(enteredText.toLowerCase())) &&
            [1, 2, 3, 4, 5, 6].includes(stock.exchangeId)
            : false;
        });

        setFilters(desiredList);
      }


      if ((searchInput && selectedYear !== DEFAULT_SELECTED_YEAR)) {
        getMultiLongTermGraph(selectedYear, searchInput)
        getMultiLineGraphLt(searchInput)
      } else if (searchInput && selectedYear === "dateToDate") {
        getMultiLongTermGraph(selectedYear, searchInput)
        getMultiLineGraphLt(searchInput)
      } else {
        fetchSensexData();
      }
    }
  }

  const grapHoleData = dataGraph?.lineData || [];
  let lineData = grapHoleData?.map(([x, y]) => ({
    x: parseInt(x),
    y: parseFloat(y),
  }));




  let lastApiRequestTime = new Date();
const marketStartTime = new Date();
marketStartTime.setHours(9, 15, 0, 0);
const marketEndTime = new Date();
marketEndTime.setHours(15, 31, 0, 0);


let lastPriceTick = Number(price); 
console.log('lastPriceTick', lastPriceTick, marketStartTime)
if (
  lastApiRequestTime > marketStartTime && lastApiRequestTime < marketEndTime
) {
  console.log("Inside loop during market hours1:");

  if (Array.isArray(lineData) && lineData.length > 0) {
  

    let newDataPoint = {
      x: lineData[lineData.length - 1]?.x, 
      y:    lineData[lineData.length - 1]?.y 
    };
    lineData.push(newDataPoint);
    console.log("Updated lineData during market hours:", lineData);
  } else {
    console.error("lineData is not an array or is empty.");
  }
} else {

  console.log("Inside loop after market hours2:");

  if (Array.isArray(lineData) && lineData.length > 0) {
    let newDataPoint = {
      x: lineData[lineData.length - 1]?.x, 
      y: lastPriceTick 
    };
    lineData.push(newDataPoint);
    console.log("Updated lineData after market hours:", lineData);
  } else {
    console.error("lineData is not an array or is empty.");
  }
}


  




  function getYs() {
    return lineData?.map((d) => d.y);
  }

  let yArray = lineData != null && [...getYs()];
  console.log('yArray', yArray)
  let minValue = lineData != null ? Math.min(...getYs()) : "";
  console.log("minValue", minValue)
  let minIndex = lineData != null ? yArray.indexOf(minValue) : -1;
  console.log("minIndex",minIndex)
  let maxValue = lineData != null ? Math.max(...getYs()) : "";
  let maxIndex = lineData != null ? yArray.indexOf(maxValue) : -1;

  const lastPrice =
    lineData?.length > 0 ? lineData[lineData?.length - 1]?.y : 0;
  const perChange = ((lastPrice - previousClose) / previousClose) * 100;
  const changeText = perChange ? perChange.toFixed(2) : "0.0";
  const change = lastPrice - longpreviousClose;
  const changeFormatted = change.toFixed(2);
  const longPerChange =
    ((lastPrice - longpreviousClose) / longpreviousClose) * 100;
  const perChangeFormatted = longPerChange.toFixed(2);

  const { dayLow, dayHigh } =
    lineData?.length > 0 &&
    lineData?.reduce(
      (acc, point) => ({
        dayLow: Math.min(acc.dayLow, point.y),
        dayHigh: Math.max(acc.dayHigh, point.y),
      }),
      { dayLow: lineData[0].y, dayHigh: lineData[0].y }
    );

  const downloadChart = () => {
    if (!chartRef.current) return;

    const yearlyButtons = document.querySelectorAll(".yearly-button");
    yearlyButtons.forEach((button) => {
      button.style.display = "none";
    });

    const chartContainer = chartRef.current;
    const aspectRatio = 16 / 9;
    const width = chartContainer.offsetWidth;
    const height = width / aspectRatio;
    html2canvas(chartContainer, { width, height }).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL();
      link.download = `${name}.png`;
      link.click();
    });
  };

  const handleChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const formatNumber = (value) =>
    formatValue ? value?.toFixed(4) || "0.00" : value?.toFixed(2) || "0.00";

  const updatedGraph = lineData.slice(0, lineData.length - 1);
  console.log("updated", updatedGraph)

  const options = {
    series: [
      {
        name: name,
        data:
          selectedYear === DEFAULT_SELECTED_YEAR
            ? lineData || []
            : updatedGraph || [],
      },
    ],
    chart: {
      type: "area",
      zoom: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
    },
    grid: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
      width: 2,
    },
    colors: ["#000000"],
    tooltip: {
      enabled: true,
      theme: "dark",
    },
    xaxis: {
      type: "datetime",
      tickAmount: dataGraph?.graphType === "thisweek" ? 2 : dataGraph?.graphType === "week" ? 5 : undefined,
      labels: {
        show: true,
        formatter: function (value) {
          let ts = new Date(value);
          const graphType = dataGraph?.graphType;

          const options = {
            timeZone: "Asia/Kolkata",
          };

          return graphType === "week" || graphType === "thisweek"
            ? ts.toLocaleDateString("en-US", { weekday: "short", ...options })
            : graphType === "month1" ||
              graphType === "thismonth" ||
              graphType === "month3" ||
              graphType === "month6" ||
              graphType === "month12" ||
              graphType === "thisyear"
              ? ts.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                ...options,
              })
              : graphType === "year5" || graphType === "year10" || graphType === "dateToDate"
                ? ts.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", ...options })
                : ts.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  ...options,
                })
        },
        style: {
          fontWeight: "bold",
          fontSize: "17px",
        },
      },
      offsetX: "30",
    },
    yaxis: {
      show: true,
      axisBorder: {
        color: "#FF5733",
      },
      tooltip: {
        enabled: true,
        offsetX: 0,
      },
      labels: {
        style: {
          fontWeight: "bold",
          fontSize: "17px",
        },
        formatter: function (value) {
          
          return value?.toFixed(2);
        },
      },
      opposite: true,
    },
    fill: {
      type: "gradient",
      gradient: {
        shaeIntensity: 1,
        opacityFrom: 0.0,
        opacityTo: 0.0,
        stops: [0, 100],
      },
    },
    annotations: {
      yaxis: [
        {
          y: selectedYear === DEFAULT_SELECTED_YEAR ? previousClose : "",
          borderColor: "#FF0000",
          label: {
            text: `Prev Close : ${(tick &&
              previousClose &&
              parseFloat(previousClose)?.toFixed(2)) ||
              0.0
              }`,
            style: {
              fontSize: "18px",
              fontWeight: "bold",
            },
            offsetY: 10,
            offsetX: 15,
            textAnchor: "start",
            position: "top",
            borderWidth: 0,
            background: "transparent",
          },
        },
      ],
      points: [
        {
          x: lineData?.length > 0 ? lineData[lineData?.length - 1].x : 0,
          y: lineData?.length > 0 ? lineData[lineData?.length - 1].y : 0,
          label: {
            text:
              selectedYear === DEFAULT_SELECTED_YEAR
                ? `${changeText > 0 ? "⬆" : "⬇"} ${changeText}%`
                : `${changeFormatted > 0 ? "⬆" : "⬇"} ${changeFormatted}  ${perChangeFormatted > 0 ? "⬆" : "⬇"} ${perChangeFormatted}%`,
            style: {
              color:
                selectedYear === DEFAULT_SELECTED_YEAR
                  ? changeText > 0 ? "green" : "red"
                  : changeFormatted > 0 ? "green" : "red",
              fontSize: "15px",
              fontWeight: "bold",
            },
            offsetX: -30,
            offsetY: 46,
            borderWidth: 0,
          },       
        },
        {
          x: lineData?.length > 0 ? lineData[lineData?.length - 1].x : 0,
          y: lineData?.length > 0 ? lineData[lineData?.length - 1].y : 0,
          marker: {
            size: 4,
            fillColor: "#0000FF",
            strokeWidth: -1,
          },
          label: {
            text: formatValue ? lastPrice : lastPrice?.toFixed(2),
            style: {
              color: "#000000",
              fontSize: "15px",
              fontWeight: "bold",
            },
            offsetX: -25,
            offsetY: 30,
            borderWidth: 0,
          },
        },
        {
          x: lineData?.length > 0 ? lineData[maxIndex].x : 0,
          y: lineData?.length > 0 ? lineData[maxIndex].y : 0,
          marker: {
            size: 4,
            fillColor: "#008000",
            strokeWidth: -1,
          },
        },
        {
          x: lineData?.length > 0 ? lineData[minIndex].x : 0,
          y: lineData?.length > 0 ? lineData[minIndex].y : 0,
          marker: {
            size: 4,
            fillColor: "#FF0000",
            strokeWidth: -1,
          },
          // label: {
          //   text: isFinite(dayLow) ? dayLow?.toFixed(2) : 0,
          // },
        },
      ],
    },
    noData: {
      text: "No Data",
      align: "center",
      verticalAlign: "middle",
    },
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleOptionSelected = (event, value) => {
    if (value && value.exchangeSymbol) {
      setSearchInput(value.exchangeSymbol);
    }
  };

  const handleMultiChart = () => {
    setTwoLineGraph(!twoLineGraph)
    if (searchInput || (selectedYear !== DEFAULT_SELECTED_YEAR)) {
      getLongTermGraph(selectedYear);
    } else if (searchInput || selectedYear === "dateToDate") {
      getLineGraphLt();
    } else {
      fetchNiftyData();
    }
  }

  const handleEndDateChange = (event) => {
    const selectedEndDate = event.target.value;
    const selectedDate = new Date(selectedEndDate);
    const today = new Date();
    if (selectedDate > today) {
      const todayFormatted = `${currentYear}-${currentMonth}-${currentDay}`;
      setEndDate(todayFormatted);
    } else {
      setEndDate(selectedEndDate);
    }
  };

  const source = !twoLineGraph ? (id === "1" ? "NSE" : id === "2" ? "BSE" : "INTL") : '';

  return (
    <div className="center-container">
      <div className="chart-container">
        <div ref={chartRef}>
          <div className="input-container1">
            {headerVisible ? (
              <input
                className="input-field"
                type="text"
                id="user-input"
                value={header}
                onChange={headerHandleInputChange}
                onBlur={headerHandleInputBlur}
                placeholder="Header..."
              />
            ) : (
              <p className="header">
                <strong>{header}</strong>
              </p>
            )}
          </div>

          <div className="input-container2">
            {subHeaderVisible ? (
              <input
                className="input-field"
                type="text"
                id="user-input"
                value={subHeader}
                onChange={subHeaderHandleInputChange}
                onBlur={subHeaderHandleInputBlur}
                placeholder="SubHeader..."
              />
            ) : (
              <p className="subheader">{subHeader}</p>
            )}
          </div>

          <Grid item xs={12} className="title">
            <span>
              {
                !twoLineGraph && `${name} (${selectedYearValue === "Date To Date" ? `${startDate} to ${endDate}` : selectedYearValue})`
              }
            </span>
          </Grid>

          <div className="subHeaderContainer">
            <Grid container alignItems="center">
              <Grid item xs={12} sm={7}>
                <Select
                  value={selectedYear}
                  onChange={handleChange}
                  style={{ width: "120px" }}
                  size="small"
                  className="yearly-button"
                >
                  <MenuItem value="Intraday" disabled>
                    Intraday
                  </MenuItem>
                  {Object.keys(yearAbbreviations).map((key) => (
                    <MenuItem key={key} value={key}>
                      {yearAbbreviations[key]}
                    </MenuItem>
                  ))}
                </Select>
                {(selectedYear === 'dateToDate' && (
                  <>
                    <TextField
                      label="Start Date"
                      className="yearly-button"
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      sx={{ marginLeft: '5px', width: "150px" }}
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <TextField
                      label="End Date"
                      className="yearly-button"
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      sx={{ marginLeft: '5px', width: "150px" }}
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </>
                ))}

                {!twoLineGraph && <Button
                  variant="outlined"
                  sx={{ marginLeft: '5px' }}
                  onClick={handleOpenDialog}
                  className="yearly-button"
                >
                  Dashboard
                </Button>}
               
                <Button
                  variant="outlined"
                  sx={{ marginLeft: '5px' }}
                  onClick={handleMultiChart}
                  className="yearly-button"
                >
                  {`${twoLineGraph ? "Back to Intraday" : 'Multi Chart'}`}
                </Button>
                {twoLineGraph && <Autocomplete
                  freeSolo
                  id="free-solo-2-demo"
                  className="yearly-button"
                  disableClearable
                  options={filters}
                  getOptionLabel={(option) =>
                    option.exchangeSymbol ? option.exchangeSymbol : ''
                  }
                  sx={{ margin: '10px 5px', width: '150px' }}
                  onChange={handleOptionSelected}
                  inputValue={searchInput}
                  onInputChange={(event, newInputValue) => setSearchInput(newInputValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      focused
                      autoFocus
                      label="Search to compare"
                      placeholder="Search stocks"
                      variant="outlined"
                      onKeyUp={(e) => searchStock(e)}
                      size="small"
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id || option.exchangeSymbol}>
                      {option.name}
                    </li>
                  )}
                />

                }
              </Grid>
              {!twoLineGraph && <>
                <Grid item xs={6} sm={2.5}>
                  <span className="subHeader">
                    {`High: ${selectedYear === DEFAULT_SELECTED_YEAR
                      ? formatNumber(dataGraph?.dayHigh)
                      : formatNumber(dayHigh)
                      }`}
                  </span>
                </Grid>
                <Grid item xs={6} sm={2.5}>
                  <span className="subHeader">
                    {`Low: ${selectedYear === DEFAULT_SELECTED_YEAR
                      ? formatNumber(dataGraph?.dayLow)
                      : formatNumber(dayLow)
                      }`}
                  </span>
                </Grid>
              </>}
            </Grid>
            <CommonDialog
              open={openDialog}
              handleClose={handleCloseDialog}
              title={name}
              name={name}
            />
          </div>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "40vh",
              }}
            >
              <CircularProgress disableShrink />
            </Box>
          ) : (
            !twoLineGraph ?
              <ReactApexChart
                options={options}
                series={options.series}
                type="area"
                height={350}
              />
              :
              <TwoLineMixedChart searchInput={searchInput} dataGraph={dataGraph} niftyData={niftyData} sensexData={sensexData} name={name} token={token} />
          )
          }


          <div className="source-container">
            <span className="source">{source && `Source: ${source}`}</span>
            <Tooltip title="Go to Home">
              <Link to="/interested">
                <img
                  src={"../../../images/logo.png"}
                  alt="NDTVPROFIT"
                  className="BQ-logo"
                />
              </Link>
            </Tooltip>
          </div>
        </div>

        <button onClick={downloadChart} className="download-button">
          <DownloadSharpIcon />
        </button>
      </div>
    </div>
  );
}

export default ApexChart;

