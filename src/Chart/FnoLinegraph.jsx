import React, { useEffect, useState, useRef } from "react";
import Chart from "react-apexcharts";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Tooltip,
} from "@mui/material";
import { apiConfigNewsFlash } from "../commonApi/apiConfig";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import html2canvas from "html2canvas";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
const currentDay = currentDate.getDate().toString().padStart(2, "0");

const firstDayOfYear = "10-01";
const initialStartDate = `2023-${firstDayOfYear}`;
const initialEndDate = `${currentYear}-${currentMonth}-${currentDay}`;

const FnoLinegraph = ({ token }) => {
  const [futureGraph, setFutureGraph] = useState([]);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [exchangeSymbol, setExchangeSymbol] = useState("NIFTY 50");
  const [derivativeType, setDerivativeType] = useState("1");
  const [changeTurnover, setChangeTurnover] = useState("false");
  const [header, setHeader] = useState("");
  const [subHeader, setSubHeader] = useState("");
  const [headerVisible, setHeaderVisible] = useState(true);
  const [subHeaderVisible, setSubHeaderVisible] = useState(true);
  const chartRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getFutures();
  }, [exchangeSymbol, derivativeType, startDate, endDate, changeTurnover]);

  const grapHoleData = futureGraph?.lineData || [];

  // Function to get the last y value from the lineData1 array
  const getLastYValue = (data) => {
    if (Array.isArray(data) && data.length > 0) {
      const lastValue = data[data.length - 1];
      return lastValue.y.toFixed(2);
    } else {
      console.error("lineData1 is empty or undefined");
      return null;
    }
  };

  // Initialize lineData1 with mapped data
  let lineData1 =
    grapHoleData?.map(([x, y]) => ({
      x: parseInt(x),
      y: parseFloat(y),
    })) || [];

  // Get the last y value from lineData1
  const lastYValueNifty50 = getLastYValue(lineData1);
  console.log("Last y value:", lastYValueNifty50);

  // Function to get the last y value from a data array
  const getLastYValue30Days = (data) => {
    if (Array.isArray(data) && data.length > 0) {
      const lastValue = data[data.length - 1];
      return lastValue.y.toFixed(2);
    } else {
      console.error("The data array is empty or undefined");
      return null;
    }
  };

  // Initialize lineData2 with mapped data
  let lineData2 =
    grapHoleData?.map(([x, , y]) => ({
      x: parseInt(x),
      y: parseFloat(y),
    })) || [];

  // Get the last y value from lineData2
  const lastYValue30DaysAvg = getLastYValue30Days(lineData2);
  console.log(
    "Last y value from lineData2:",
    lastYValue30DaysAvg,
    lastYValueNifty50
  );

  // Initially null

  // Get the last y value after lineData1 is updated

  // console.log("linedata",lineData1,lineData2)

  // Log the entire array length minus one
  // console.log('length', graphHoleData.length);
  // // const last = graphHoleData.length

  //   const lastTick = grapHoleData?.forEach((data) => (data.length));

  const options = {
    series: [
      {
        name: `${exchangeSymbol} `,
        data: lineData1,
      },
      {
        name: "30 Day Average",
        data: lineData2,
      },
    ],
    chart: {
      type: "line",
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
    colors: ["#000000", "#FF5733"],
    tooltip: {
      enabled: true,
      theme: "dark",
    },
    xaxis: {
      type: "datetime",
      labels: {
        show: true,
        formatter: function (value) {
          let ts = new Date(value);
          const options = {
            timeZone: "Asia/Kolkata",
          };

          return ts.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            ...options,
          });
        },
        style: {
          fontWeight: "bold",
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
        },
        formatter: function (value) {
          return value?.toFixed(0);
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.0,
        opacityTo: 0.0,
        stops: [0, 100],
      },
    },
  };

  const getFutures = async () => {
    let getFuturesEndpoint;
    if (exchangeSymbol === " ") {
      getFuturesEndpoint = `fando/getOiTurnover?derivativeType=${derivativeType}&startDate=${startDate}&endDate=${endDate}&changeTurnover=${changeTurnover}`;
    } else {
      getFuturesEndpoint = `fando/getOiTurnover?exchangeSymbol=${exchangeSymbol}&derivativeType=${derivativeType}&startDate=${startDate}&endDate=${endDate}&changeTurnover=${changeTurnover}`;
    }

    try {
      const response = await apiConfigNewsFlash(`${getFuturesEndpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFutureGraph(response);
    } catch (error) {
      if (!token) {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
      setFutureGraph([]);
      console.error(error);
    }
  };

  const handleStartDateChange = (event) => {
    const selectedStartDate = event.target.value;
    const selectedDate = new Date(selectedStartDate);
    const currentYearStartDate = new Date(currentYear, 0, 1);

    if (selectedDate < currentYearStartDate) {
      setStartDate(`${initialStartDate}`);
    } else {
      setStartDate(selectedStartDate);
    }
  };

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
      link.download = `name.png`;
      link.click();
    });
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

  return (
    <div className="chart-container fno-chart">
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

        <div
          style={{ display: "inline-flex", gap: "10px", margin: "10px 20px" }}
        >
          <FormControl
            className="yearly-button"
            size="small"
            variant="outlined"
            style={{ minWidth: 120 }}
          >
            <InputLabel id="select-label-symbol">Symbol</InputLabel>
            <Select
              labelId="select-label-symbol"
              label="Symbol"
              value={exchangeSymbol}
              onChange={(e) => setExchangeSymbol(e.target.value)}
            >
              <MenuItem value="NIFTY 50">NIFTY 50</MenuItem>
              <MenuItem value="NIFTY BANK">NIFTY BANK</MenuItem>
              <MenuItem value="NIFTY MID SELECT">NIFTY MID SELECT</MenuItem>
              <MenuItem value="NIFTY FIN SERVICE">NIFTY FIN SERVICE</MenuItem>
              <MenuItem value="Stock">STOCK</MenuItem>
              <MenuItem value=" ">ALL</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            className="yearly-button"
            size="small"
            variant="outlined"
            style={{ minWidth: 120 }}
          >
            <InputLabel id="select-label-type">Type</InputLabel>
            <Select
              labelId="select-label-type"
              label="Type"
              value={derivativeType}
              onChange={(e) => setDerivativeType(e.target.value)}
            >
              <MenuItem value="1">FUTURE</MenuItem>
              <MenuItem value="2">OPTION</MenuItem>
              <MenuItem value="1,2">ALL</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            className="yearly-button"
            size="small"
            variant="outlined"
            style={{ minWidth: 120 }}
          >
            <InputLabel id="select-label-datatype">Data Type</InputLabel>
            <Select
              labelId="select-label-datatype"
              label="Data Type"
              value={changeTurnover}
              onChange={(e) => setChangeTurnover(e.target.value)}
            >
              <MenuItem value="false">OI TURN OVER</MenuItem>
              <MenuItem value="true">CHANGE OI TURNOVER</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Start Date"
            className="yearly-button"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            sx={{ marginLeft: "5px", width: "150px" }}
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
            sx={{ marginLeft: "5px", width: "150px" }}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </div>

        
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
      <span style={{ width: '10px', height: '10px', backgroundColor: 'black', borderRadius: '50%', display: 'inline-block', marginRight: '5px' }}></span>
      <span>{exchangeSymbol}: {lastYValueNifty50}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ width: '10px', height: '10px', backgroundColor: 'red', borderRadius: '50%', display: 'inline-block', marginRight: '5px' }}></span>
      <span>30 Day Average: {lastYValue30DaysAvg}</span>
    </div>
  </div>


        <Chart
          options={options}
          series={options.series}
          type="area"
          height={350}
        />

        <div className="source-container">
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
  );
};

export default FnoLinegraph;
