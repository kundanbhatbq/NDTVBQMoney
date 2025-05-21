import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Grid,
  Tooltip,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import CloseIcon from "@mui/icons-material/Close";
import Cookies from "js-cookie";
import { apiConfig } from "../../commonApi/apiConfig";
import html2canvas from "html2canvas";
import { styled } from "@mui/material/styles"; // Import styled
import "./FiiDii.css";

const FIIDII = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  const [FiiDii, setFiDii] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openChart, setOpenChart] = useState(false);
  //const [openFiiTrend, setopenFiiTrend]=useState(false)

  const [openfiiTrend, setOpenFiiTrend] = useState(false);
  const [openDiiTrend, setOpenDiiTrend] = useState(false);
  const [openFiIDiiFlows, setopenFiIDiiFlows] = useState(false);
  const [fundFlow, setFundFlow] = useState(false);
  const [FiiFNO, setFiiFNO] = useState();
  const [currentFiiFno, setcurrentFiiFno] = useState();
  const [CurrentDateFiiDii, setCurrentDateFiiDii] = useState();
  const [FiiDiiFlowsData, setFiiDiiFlowsData] = useState();
  const [NiftyPrice, setNiftyPrice] = useState();

  const filteredData = [
    ...(Array.isArray(currentFiiFno) ? currentFiiFno : [currentFiiFno]),
    ...(Array.isArray(CurrentDateFiiDii)
      ? CurrentDateFiiDii
      : [CurrentDateFiiDii]),
  ];

  let FiiDate = FiiDii?.[0]?.date


  useEffect(() => {
    const tokenFromCookies = Cookies.get("token");
    if (tokenFromCookies) {
      setToken(tokenFromCookies);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchFIIDII = async () => {
    try {
      setLoading(true);
      const res = await apiConfig(`fiidiiData`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const FiiFnoRes = await apiConfig(`getDerivativesfii`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const nifty50price = await apiConfig(
        "dashboard?exchangeSymbol=NIFTY%2050",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNiftyPrice(nifty50price);

      const dataWithIds = res.map((item, index) => ({
        ...item,
        id: index,
      }));
      const dataWithIdsFiiFno = FiiFnoRes.forEach((item, index) => ({
        ...item,
        id: index,
      }));

      const CurrentDateFiiFno = FiiFnoRes[FiiFnoRes.length - 1]; // Gets the last
      const CurrentDateFiiDii = res[0]; // getting first
      setFiDii(dataWithIds);
      setFiiFNO(dataWithIdsFiiFno);

      setcurrentFiiFno(CurrentDateFiiFno);
      setCurrentDateFiiDii(CurrentDateFiiDii);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setFiDii([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFIIDIIFLOWS = async () => {
    try {
      setLoading(true);
      const res = await apiConfig(`aggregated-data-fiidii`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataWithIds = res.map((item, index) => ({
        ...item,
        id: index,
      }));
      setFiiDiiFlowsData(res);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setFiiDiiFlowsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFIIDII();
    fetchFIIDIIFLOWS();
  }, [token]);

  const columns = [
    {
      field: "date",
      headerName: "Date",
      width: 120,
      type: "Date",
      headerClassName: "super-app-theme--header",
      cellClassName: "data-grid-cell",
    },
    {
      field: "fiiBuyValue",
      headerName: "FII Buy Value (₹ Cr.)",
      width: 180,
      type: "number",
      headerClassName: "super-app-theme--header",
      valueFormatter: (params) => params.value.toLocaleString("en-IN"),
    },
    {
      field: "fiiSellValue",
      headerName: "FII Sell Value (₹ Cr.)",
      width: 180,
      type: "number",
      headerClassName: "super-app-theme--header",
      valueFormatter: (params) => params.value.toLocaleString("en-IN"),
    },
    {
      field: "fiiNetValue",
      headerName: "FII Net Value (₹ Cr.)",
      width: 180,
      type: "number",
      headerClassName: "super-app-theme--header",
      valueFormatter: (params) => params.value.toLocaleString("en-IN"),
      renderCell: (params) => (
        <span
          style={{
            color: params.value > 0 ? "#2E7D32" : "#C62828",
            fontWeight: "bold",
            backgroundColor:
              params.value > 0
                ? "rgba(46, 125, 50, 0.1)"
                : "rgba(198, 40, 40, 0.1)",
            padding: "4px 8px",
            borderRadius: "4px",
            width: "100%",
            textAlign: "center",
          }}
        >
          {params.value > 0
            ? `+${params.value.toFixed(2)}`
            : params.value.toFixed(2)}
        </span>
      ),
    },
    {
      field: "diiBuyValue",
      headerName: "DII Buy Value (₹ Cr.)",
      width: 180,
      type: "number",
      headerClassName: "super-app-theme--header",
      valueFormatter: (params) => params.value.toLocaleString("en-IN"),
    },
    {
      field: "diiSellValue",
      headerName: "DII Sell Value (₹ Cr.)",
      width: 180,
      type: "number",
      headerClassName: "super-app-theme--header",
      valueFormatter: (params) => params.value.toLocaleString("en-IN"),
    },
    {
      field: "diiNetValue",
      headerName: "DII Net Value (₹ Cr.)",
      width: 180,
      type: "number",
      headerClassName: "super-app-theme--header",
      valueFormatter: (params) => params.value.toLocaleString("en-IN"),
      renderCell: (params) => (
        <span
          style={{
            color: params.value > 0 ? "#2E7D32" : "#C62828",
            fontWeight: "bold",
            backgroundColor:
              params.value > 0
                ? "rgba(46, 125, 50, 0.1)"
                : "rgba(198, 40, 40, 0.1)",
            padding: "4px 8px",
            borderRadius: "4px",
            width: "100%",
            textAlign: "center",
          }}
        >
          {params.value > 0
            ? `+${params.value.toFixed(2)}`
            : params.value.toFixed(2)}
        </span>
      ),
    },
    {
      field: "fiiDiiNetValue",
      headerName: "FII-DII Net (₹ Cr.)",
      width: 180,
      type: "number",
      headerClassName: "super-app-theme--header",
      valueFormatter: (params) => params.value.toLocaleString("en-IN"),
      renderCell: (params) => (
        <span
          style={{
            color: params.value > 0 ? "#2E7D32" : "#C62828",
            fontWeight: "bold",
            backgroundColor:
              params.value > 0
                ? "rgba(46, 125, 50, 0.1)"
                : "rgba(198, 40, 40, 0.1)",
            padding: "4px 8px",
            borderRadius: "4px",
            width: "100%",
            textAlign: "center",
          }}
        >
          {params.value > 0
            ? `+${params.value.toFixed(2)}`
            : params.value.toFixed(2)}
        </span>
      ),
    },
  ];

  //  DIV CONTAINER FOR BUTTON
  const StyledToolbarContainer = styled("div")({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  });

  //SHOW TREND
  const CustomToolbar = () => (
 
      <Button
        variant="contained"
        onClick={() => setOpenChart(true)}
        sx={{
          backgroundColor: "#1A237E",
          color: "white",
          marginRight: 2,
          "&:hover": { backgroundColor: "#303F9F" },
        }}
      >
        Show Trend
      </Button>
 
  );

  // FUND FLOW
  const CustomToolbar2 = () => (
   
      <Button
        variant="contained"
        onClick={() => setFundFlow(true)}
        sx={{
          backgroundColor: "#1A237E",
          color: "white",
          marginRight: 2,
          "&:hover": { backgroundColor: "#303F9F" },
        }}
      >
        FUND FLOW
      </Button>
 
  );

  // FII TREND
  const CustomToolbar3 = () => (
  
      <Button
        variant="contained"
        onClick={() => setOpenFiiTrend(true)}
        sx={{
          backgroundColor: "#1A237E",
          color: "white",
          marginRight: 2,
          "&:hover": { backgroundColor: "#303F9F" },
        }}
      >
        FII Trend
      </Button>
 
  );

  // DII TREND
  const CustomToolbar4 = () => (
 
      <Button
        variant="contained"
        onClick={() => setOpenDiiTrend(true)}
        sx={{
          backgroundColor: "#1A237E",
          color: "white",
          marginRight: 2,
          "&:hover": { backgroundColor: "#303F9F" },
        }}
      >
        DII Trend
      </Button>

  );

  // FII-DII FLOWS

  const CustomToolbar5 = () => (

      <Button
        variant="contained"
        onClick={() => setopenFiIDiiFlows(true)}
        sx={{
          backgroundColor: "#1A237E",
          color: "white",
          marginRight: 2,
          "&:hover": { backgroundColor: "#303F9F" },
        }}
      >
        FII-DII FLOWS
      </Button>

  );

  // Modified NDTVStyleChart component with fixed label positioning
  //SHOW TREND
  const NDTVStyleChart = ({ data }) => {
    const [hoverPoint, setHoverPoint] = useState(null);
    const [logoImage, setLogoImage] = useState(null);
    const [logoDataUrl, setLogoDataUrl] = useState(null);

    useEffect(() => {
      // Preload logo image and convert to data URL
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = "../../images/logo.png"; // Your logo path
      img.onload = () => {
        setLogoImage(img);

        // Convert the image to data URL immediately
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        setLogoDataUrl(dataUrl);
      };
    }, []);

    if (!data || data.length === 0) return null;

    // Sort data by date (ascending) for charting
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const width = 1000;
    const height = 400;
    const padding = { top: 50, right: 120, bottom: 100, left: 80 };

    // Extract fiiDiiNetValue and dates for charting
    const chartData = sortedData.map((item) => ({
      date: new Date(item.date),
      value: Math.round(item.fiiDiiNetValue),
    }));

    // Function to capture and download graph
    const handleDownload = () => {
      const chartElement = document.getElementById("chart-container");

      // Before capturing, make sure we're using the data URL version of the logo
      const svgElement = chartElement.querySelector("svg");
      const imgElement = svgElement.querySelector("#logo-image");
      if (imgElement && logoDataUrl) {
        imgElement.setAttribute("href", logoDataUrl);
      }

      // Configuration for better image quality and handling external resources
      const options = {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      };

      html2canvas(chartElement, options).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "FIIDII.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    };

    // Find min and max for scaling
    const values = chartData.map((d) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const absMax = Math.max(Math.abs(minValue), Math.abs(maxValue)) * 1.1; // Add 10% margin

    // Scale functions
    const xScale = (index) => {
      return (
        padding.left +
        (index / (chartData.length - 1)) *
          (width - padding.left - padding.right)
      );
    };

    const yScale = (value) => {
      // Center the zero line
      const zeroY = padding.top + (height - padding.top - padding.bottom) / 2;
      return (
        zeroY - (value / absMax) * ((height - padding.top - padding.bottom) / 2)
      );
    };

    // Format date for display in tooltip
    const formatDateFull = (date) => {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return date.toLocaleDateString("en-IN", options);
    };

    // Format date labels for x-axis
    const formatDateLabel = (date) => {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${date.getDate()} ${
        months[date.getMonth()]
      } ${date.getFullYear()}`;
    };

    // Select a reasonable number of x-axis labels to display - REDUCED TO 5 FROM 6
    const numberOfLabels = 5;
    const step = Math.floor(chartData.length / (numberOfLabels - 1));
    const xTicks = [];

    // Add evenly spaced ticks
    for (let i = 0; i < chartData.length; i += step) {
      if (xTicks.length < numberOfLabels - 1 && i < chartData.length) {
        xTicks.push({
          x: xScale(i),
          label: formatDateLabel(chartData[i].date),
        });
      }
    }

    // Always add the last date as the final tick
    if (chartData.length > 0) {
      xTicks.push({
        x: xScale(chartData.length - 1),
        label: formatDateLabel(chartData[chartData.length - 1].date),
      });
    }

    // Y-axis ticks based on the min and max values
    const yTickCount = 6; // Number of y-axis ticks (including zero)
    const yTicks = [];

    // Calculate y-ticks based on the abs max value
    const yTickStep = absMax / Math.floor(yTickCount / 2);

    // Add positive ticks
    for (let i = 0; i <= Math.floor(yTickCount / 2); i++) {
      const value = i * yTickStep;
      if (value <= absMax) {
        yTicks.push({
          y: yScale(value),
          value: Math.round(value),
          label: value.toFixed(0),
        });
      }
    }

    // Add negative ticks
    for (let i = 1; i <= Math.floor(yTickCount / 2); i++) {
      const value = -i * yTickStep;
      if (value >= -absMax) {
        yTicks.push({
          y: yScale(value),
          value: Math.round(value),
          label: value.toFixed(0),
        });
      }
    }

    // Format large numbers for display
    const formatLargeNumber = (num) => {
      return new Intl.NumberFormat("en-IN").format(num);
    };

    const currentValue = chartData[chartData.length - 1].value;

    // Handler for mouse movement
    const handleMouseMove = (event) => {
      const svgElement = event.currentTarget;
      const rect = svgElement.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;

      // Calculate relative position considering viewBox
      const svgWidth = svgElement.clientWidth;
      const viewBoxWidth = width;
      const ratio = viewBoxWidth / svgWidth;

      const adjustedMouseX = mouseX * ratio;

      // Find the closest data point
      let closestIndex = 0;
      let closestDistance = Infinity;

      chartData.forEach((point, index) => {
        const pointX = xScale(index);
        const distance = Math.abs(adjustedMouseX - pointX);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Only update if close enough to the line (within 15px)
      if (closestDistance < 15 * ratio) {
        setHoverPoint({
          index: closestIndex,
          date: chartData[closestIndex].date,
          value: chartData[closestIndex].value,
          x: xScale(closestIndex),
          y: yScale(chartData[closestIndex].value),
        });
      } else {
        setHoverPoint(null);
      }
    };

    // Handler for mouse leave
    const handleMouseLeave = () => {
      setHoverPoint(null);
    };

    // Create paths for each segment, colored by trend
    const generateColoredPaths = () => {
      if (chartData.length < 2) return [];

      const segments = [];

      for (let i = 0; i < chartData.length - 1; i++) {
        const startX = xScale(i);
        const startY = yScale(chartData[i].value);
        const endX = xScale(i + 1);
        const endY = yScale(chartData[i + 1].value);

        // Determine color based on whether the value increases or decreases
        const isIncreasing = chartData[i + 1].value > chartData[i].value;

        segments.push({
          path: `M ${startX} ${startY} L ${endX} ${endY}`,
          color: isIncreasing ? "#2E7D32" : "#C62828", // Green for increasing, Red for decreasing
        });
      }

      return segments;
    };

    const pathSegments = generateColoredPaths();

    return (
      <div style={{ textAlign: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownload}
          sx={{ display: "flex", justifyContent: "flex-start" }}
        >
          Download
        </Button>

        <div id="chart-container">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Title */}
            <text
              x={padding.left}
              y={19}
              style={{ fontSize: "24px", fontWeight: "bold" }}
            >
              Net Institutional Flow
            </text>

            {/* Subtitle */}
            <text
              x={padding.left}
              y={34}
              style={{ fontSize: "16px", fill: "#666" }}
            >
              (FPIs - DIIs Net Investment, In Rs Crore)
            </text>

            {/* Y-axis grid lines */}
            {yTicks.map((tick, i) => (
              <line
                key={`grid-${i}`}
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#eee"
                strokeWidth="1"
              />
            ))}

            {/* Zero line - make it more prominent */}
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={yScale(0)}
              y2={yScale(0)}
              stroke="#ccc"
              strokeWidth="1.5"
            />

            {/* Y-axis line */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={height - padding.bottom}
              stroke="#666"
              strokeWidth="1.5"
            />

            {/* X-axis line */}
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="#666"
              strokeWidth="1.5"
            />

            {/* Legend */}

            {/* Y-axis labels */}
            {yTicks.map((tick, i) => (
              <text
                key={`label-${i}`}
                x={padding.left - 10}
                y={tick.y}
                textAnchor="end"
                alignmentBaseline="middle"
                style={{ fontSize: "12px", fill: "#666" }}
              >
                {formatLargeNumber(tick.value)}
              </text>
            ))}

            {/* Render colored line segments */}
            {pathSegments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill="none"
                stroke={segment.color}
                strokeWidth="1.5"
              />
            ))}

            {/* Hover area - transparent overlay across the chart area */}
            <rect
              x={padding.left}
              y={padding.top}
              width={width - padding.left - padding.right}
              height={height - padding.top - padding.bottom}
              fill="transparent"
            />

            {/* X-axis labels - ADJUSTED FOR BETTER SPACING */}
            {xTicks.map((tick, i) => (
              <text
                key={i}
                x={tick.x}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                style={{ fontSize: "14px", fill: "#666" }}
              >
                {tick.label}
              </text>
            ))}

            {/* Y-axis title */}
            <text
              x={padding.left - 40}
              y={padding.top + (height - padding.top - padding.bottom) / 2}
              textAnchor="middle"
              transform={`rotate(-90, ${padding.left - 40}, ${
                padding.top + (height - padding.top - padding.bottom) / 2
              })`}
              style={{ fontSize: "14px", fill: "#666" }}
            >
              Rs Crore
            </text>

            {/* Current value display */}
            <text
              x={width - padding.right + 10}
              y={yScale(chartData[chartData.length - 1].value)}
              textAnchor="start"
              alignmentBaseline="middle"
              style={{ fontSize: "14px", fill: "#666" }}
            >
              Net (Rs Crore)
            </text>

            <text
              x={width - padding.right + 10}
              y={yScale(chartData[chartData.length - 1].value) + 20}
              textAnchor="start"
              alignmentBaseline="middle"
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                fill: currentValue >= 0 ? "#2E7D32" : "#C62828",
              }}
            >
              {currentValue}
            </text>

            {/* Hover effect - Dot marker */}
            {hoverPoint && (
              <>
                {/* Vertical line */}
                <line
                  x1={hoverPoint.x}
                  y1={padding.top}
                  x2={hoverPoint.x}
                  y2={height - padding.bottom}
                  stroke="#888"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />

                {/* Point marker */}
                <circle
                  cx={hoverPoint.x}
                  cy={hoverPoint.y}
                  r={5}
                  fill={hoverPoint.value >= 0 ? "#2E7D32" : "#C62828"}
                  stroke="#fff"
                  strokeWidth="2"
                />

                {/* Tooltip background */}
                <rect
                  x={hoverPoint.x + 10}
                  y={hoverPoint.y - 35}
                  width={180}
                  height={70}
                  rx={4}
                  ry={4}
                  fill="white"
                  stroke="#888"
                  strokeWidth="1"
                  opacity="0.95"
                />

                {/* Tooltip text - Date */}
                <text
                  x={hoverPoint.x + 20}
                  y={hoverPoint.y - 10}
                  style={{ fontSize: "14px", fontWeight: "bold" }}
                >
                  {formatDateFull(hoverPoint.date)}
                </text>

                {/* Tooltip text - Value */}
                <text
                  x={hoverPoint.x + 20}
                  y={hoverPoint.y + 15}
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    fill: hoverPoint.value >= 0 ? "#2E7D32" : "#C62828",
                  }}
                >
                  {hoverPoint.value >= 0 ? "+" : ""}
                  {hoverPoint.value.toFixed(2).toLocaleString("en-IN")} ₹ Cr.
                </text>
              </>
            )}

            {/* Use data URL for logo instead of path */}
            <image
              href={logoDataUrl || "../../images/logo.png"}
              x={width - padding.right - 90}
              y={height - 40}
              height="40"
              width="120"
              id="logo-image"
            />
          </svg>
        </div>
      </div>
    );
  };

  // FII TREND
  const FiiTrend = ({ data }) => {
    const [hoverPoint, setHoverPoint] = useState(null);
    const [logoImage, setLogoImage] = useState(null);
    const [logoDataUrl, setLogoDataUrl] = useState(null);

    useEffect(() => {
      // Preload logo image and convert to data URL
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = "../../images/logo.png"; // Your logo path
      img.onload = () => {
        setLogoImage(img);

        // Convert the image to data URL immediately
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        setLogoDataUrl(dataUrl);
      };
    }, []);

    if (!data || data.length === 0) return null;

    // Sort data by date (ascending) for charting
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const width = 1000;
    const height = 400;
    const padding = { top: 50, right: 120, bottom: 100, left: 80 };

    // Extract fiiDiiNetValue and dates for charting
    const chartData = sortedData.map((item) => ({
      date: new Date(item.date),
      value: Math.round(item.fiiNetValue),
    }));

    // Function to capture and download graph
    const handleDownload = () => {
      const chartElement = document.getElementById("chart-container");

      // Before capturing, make sure we're using the data URL version of the logo
      const svgElement = chartElement.querySelector("svg");
      const imgElement = svgElement.querySelector("#logo-image");
      if (imgElement && logoDataUrl) {
        imgElement.setAttribute("href", logoDataUrl);
      }

      // Configuration for better image quality and handling external resources
      const options = {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      };

      html2canvas(chartElement, options).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "FIIDII.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    };

    // Find min and max for scaling
    const values = chartData.map((d) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const absMax = Math.max(Math.abs(minValue), Math.abs(maxValue)) * 1.1; // Add 10% margin

    // Scale functions
    const xScale = (index) => {
      return (
        padding.left +
        (index / (chartData.length - 1)) *
          (width - padding.left - padding.right)
      );
    };

    const yScale = (value) => {
      // Center the zero line
      const zeroY = padding.top + (height - padding.top - padding.bottom) / 2;
      return (
        zeroY - (value / absMax) * ((height - padding.top - padding.bottom) / 2)
      );
    };

    // Format date for display in tooltip
    const formatDateFull = (date) => {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return date.toLocaleDateString("en-IN", options);
    };

    // Format date labels for x-axis
    const formatDateLabel = (date) => {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${date.getDate()} ${
        months[date.getMonth()]
      } ${date.getFullYear()}`;
    };

    // Select a reasonable number of x-axis labels to display - REDUCED TO 5 FROM 6
    const numberOfLabels = 5;
    const step = Math.floor(chartData.length / (numberOfLabels - 1));
    const xTicks = [];

    // Add evenly spaced ticks
    for (let i = 0; i < chartData.length; i += step) {
      if (xTicks.length < numberOfLabels - 1 && i < chartData.length) {
        xTicks.push({
          x: xScale(i),
          label: formatDateLabel(chartData[i].date),
        });
      }
    }

    // Always add the last date as the final tick
    if (chartData.length > 0) {
      xTicks.push({
        x: xScale(chartData.length - 1),
        label: formatDateLabel(chartData[chartData.length - 1].date),
      });
    }

    // Y-axis ticks based on the min and max values
    const yTickCount = 6; // Number of y-axis ticks (including zero)
    const yTicks = [];

    // Calculate y-ticks based on the abs max value
    const yTickStep = absMax / (yTickCount / 2);

    // Add positive ticks
    for (let i = 0; i <= yTickCount / 2; i++) {
      const value = i * yTickStep;
      if (value <= absMax) {
        yTicks.push({
          y: yScale(value),
          value: Math.round(value),
          label: value,
        });
      }
    }

    // Add negative ticks
    for (let i = 1; i <= yTickCount / 2; i++) {
      const value = -i * yTickStep;
      if (value >= -absMax) {
        yTicks.push({
          y: yScale(value),
          value: Math.round(value),
          label: value,
        });
      }
    }

    // Format large numbers for display
    const formatLargeNumber = (num) => {
      return new Intl.NumberFormat("en-IN").format(num);
    };

    const currentValue = chartData[chartData.length - 1].value;

    // Handler for mouse movement
    const handleMouseMove = (event) => {
      const svgElement = event.currentTarget;
      const rect = svgElement.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;

      // Calculate relative position considering viewBox
      const svgWidth = svgElement.clientWidth;
      const viewBoxWidth = width;
      const ratio = viewBoxWidth / svgWidth;

      const adjustedMouseX = mouseX * ratio;

      // Find the closest data point
      let closestIndex = 0;
      let closestDistance = Infinity;

      chartData.forEach((point, index) => {
        const pointX = xScale(index);
        const distance = Math.abs(adjustedMouseX - pointX);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Only update if close enough to the line (within 15px)
      if (closestDistance < 15 * ratio) {
        setHoverPoint({
          index: closestIndex,
          date: chartData[closestIndex].date,
          value: chartData[closestIndex].value,
          x: xScale(closestIndex),
          y: yScale(chartData[closestIndex].value),
        });
      } else {
        setHoverPoint(null);
      }
    };

    // Handler for mouse leave
    const handleMouseLeave = () => {
      setHoverPoint(null);
    };

    // Create paths for each segment, colored by trend
    const generateColoredPaths = () => {
      if (chartData.length < 2) return [];

      const segments = [];

      for (let i = 0; i < chartData.length - 1; i++) {
        const startX = xScale(i);
        const startY = yScale(chartData[i].value);
        const endX = xScale(i + 1);
        const endY = yScale(chartData[i + 1].value);

        // Determine color based on whether the value increases or decreases
        const isIncreasing = chartData[i + 1].value > chartData[i].value;

        segments.push({
          path: `M ${startX} ${startY} L ${endX} ${endY}`,
          color: isIncreasing ? "#2E7D32" : "#C62828", // Green for increasing, Red for decreasing
        });
      }

      return segments;
    };

    const pathSegments = generateColoredPaths();

    return (
      <div style={{ textAlign: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownload}
          sx={{ display: "flex", justifyContent: "flex-start" }}
        >
          Download
        </Button>

        <div id="chart-container">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Title */}
            <text
              x={padding.left}
              y={19}
              style={{ fontSize: "24px", fontWeight: "bold" }}
            >
              FII Flows (Provisional)
            </text>

            {/* Subtitle */}
            <text
              x={padding.left}
              y={34}
              style={{ fontSize: "16px", fill: "#666" }}
            >
              (Rs Crore)
            </text>

            {/* Y-axis grid lines */}
            {yTicks.map((tick, i) => (
              <line
                key={`grid-${i}`}
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#eee"
                strokeWidth="1"
              />
            ))}

            {/* Zero line - make it more prominent */}
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={yScale(0)}
              y2={yScale(0)}
              stroke="#ccc"
              strokeWidth="1.5"
            />

            {/* Y-axis line */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={height - padding.bottom}
              stroke="#666"
              strokeWidth="1.5"
            />

            {/* X-axis line */}
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="#666"
              strokeWidth="1.5"
            />

            {/* Legend */}

            {/* Y-axis labels */}
            {yTicks.map((tick, i) => (
              <text
                key={`label-${i}`}
                x={padding.left - 10}
                y={tick.y}
                textAnchor="end"
                alignmentBaseline="middle"
                style={{ fontSize: "12px", fill: "#666" }}
              >
                {formatLargeNumber(tick.value)}
              </text>
            ))}

            {/* Render colored line segments */}
            {pathSegments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill="none"
                stroke={segment.color}
                strokeWidth="1.5"
              />
            ))}

            {/* Hover area - transparent overlay across the chart area */}
            <rect
              x={padding.left}
              y={padding.top}
              width={width - padding.left - padding.right}
              height={height - padding.top - padding.bottom}
              fill="transparent"
            />

            {/* X-axis labels - ADJUSTED FOR BETTER SPACING */}
            {xTicks.map((tick, i) => (
              <text
                key={i}
                x={tick.x}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                style={{ fontSize: "14px", fill: "#666" }}
              >
                {tick.label}
              </text>
            ))}

            {/* Y-axis title */}
            <text
              x={padding.left - 40}
              y={padding.top + (height - padding.top - padding.bottom) / 2}
              textAnchor="middle"
              transform={`rotate(-90, ${padding.left - 40}, ${
                padding.top + (height - padding.top - padding.bottom) / 2
              })`}
              style={{ fontSize: "14px", fill: "#666" }}
            >
              Rs Crore
            </text>

            {/* Current value display */}
            <text
              x={width - padding.right + 10}
              y={yScale(chartData[chartData.length - 1].value)}
              textAnchor="start"
              alignmentBaseline="middle"
              style={{ fontSize: "14px", fill: "#666" }}
            >
              Net (Rs Crore)
            </text>

            <text
              x={width - padding.right + 10}
              y={yScale(chartData[chartData.length - 1].value) + 20}
              textAnchor="start"
              alignmentBaseline="middle"
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                fill: currentValue >= 0 ? "#2E7D32" : "#C62828",
              }}
            >
              {currentValue}
            </text>

            {/* Hover effect - Dot marker */}
            {hoverPoint && (
              <>
                {/* Vertical line */}
                <line
                  x1={hoverPoint.x}
                  y1={padding.top}
                  x2={hoverPoint.x}
                  y2={height - padding.bottom}
                  stroke="#888"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />

                {/* Point marker */}
                <circle
                  cx={hoverPoint.x}
                  cy={hoverPoint.y}
                  r={5}
                  fill={hoverPoint.value >= 0 ? "#2E7D32" : "#C62828"}
                  stroke="#fff"
                  strokeWidth="2"
                />

                {/* Tooltip background */}
                <rect
                  x={hoverPoint.x + 10}
                  y={hoverPoint.y - 35}
                  width={180}
                  height={70}
                  rx={4}
                  ry={4}
                  fill="white"
                  stroke="#888"
                  strokeWidth="1"
                  opacity="0.95"
                />

                {/* Tooltip text - Date */}
                <text
                  x={hoverPoint.x + 20}
                  y={hoverPoint.y - 10}
                  style={{ fontSize: "14px", fontWeight: "bold" }}
                >
                  {formatDateFull(hoverPoint.date)}
                </text>

                {/* Tooltip text - Value */}
                <text
                  x={hoverPoint.x + 20}
                  y={hoverPoint.y + 15}
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    fill: hoverPoint.value >= 0 ? "#2E7D32" : "#C62828",
                  }}
                >
                  {hoverPoint.value >= 0 ? "+" : ""}
                  {hoverPoint.value.toFixed(2).toLocaleString("en-IN")} ₹ Cr.
                </text>
              </>
            )}

            {/* Use data URL for logo instead of path */}
            <image
              href={logoDataUrl || "../../images/logo.png"}
              x={width - padding.right - 90}
              y={height - 40}
              height="40"
              width="120"
              id="logo-image"
            />
          </svg>
        </div>
      </div>
    );
  };

  // DII TREND
  const DiiTrend = ({ data }) => {
    const [hoverPoint, setHoverPoint] = useState(null);
    const [logoImage, setLogoImage] = useState(null);
    const [logoDataUrl, setLogoDataUrl] = useState(null);

    useEffect(() => {
      // Preload logo image and convert to data URL
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = "../../images/logo.png"; // Your logo path
      img.onload = () => {
        setLogoImage(img);

        // Convert the image to data URL immediately
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        setLogoDataUrl(dataUrl);
      };
    }, []);

    if (!data || data.length === 0) return null;

    // Sort data by date (ascending) for charting
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const width = 1000;
    const height = 400;
    const padding = { top: 50, right: 120, bottom: 100, left: 80 };

    // Extract fiiDiiNetValue and dates for charting
    const chartData = sortedData.map((item) => ({
      date: new Date(item.date),
      value: Math.round(item.diiNetValue),
    }));

    // Function to capture and download graph
    const handleDownload = () => {
      const chartElement = document.getElementById("chart-container");

      // Before capturing, make sure we're using the data URL version of the logo
      const svgElement = chartElement.querySelector("svg");
      const imgElement = svgElement.querySelector("#logo-image");
      if (imgElement && logoDataUrl) {
        imgElement.setAttribute("href", logoDataUrl);
      }

      // Configuration for better image quality and handling external resources
      const options = {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      };

      html2canvas(chartElement, options).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "FIIDII.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    };

    // Find min and max for scaling
    const values = chartData.map((d) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const absMax = Math.max(Math.abs(minValue), Math.abs(maxValue)) * 1.1; // Add 10% margin

    // Scale functions
    const xScale = (index) => {
      return (
        padding.left +
        (index / (chartData.length - 1)) *
          (width - padding.left - padding.right)
      );
    };

    const yScale = (value) => {
      // Center the zero line
      const zeroY = padding.top + (height - padding.top - padding.bottom) / 2;
      return (
        zeroY - (value / absMax) * ((height - padding.top - padding.bottom) / 2)
      );
    };

    // Format date for display in tooltip
    const formatDateFull = (date) => {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return date.toLocaleDateString("en-IN", options);
    };

    // Format date labels for x-axis
    const formatDateLabel = (date) => {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${date.getDate()} ${
        months[date.getMonth()]
      } ${date.getFullYear()}`;
    };

    // Select a reasonable number of x-axis labels to display - REDUCED TO 5 FROM 6
    const numberOfLabels = 5;
    const step = Math.floor(chartData.length / (numberOfLabels - 1));
    const xTicks = [];

    // Add evenly spaced ticks
    for (let i = 0; i < chartData.length; i += step) {
      if (xTicks.length < numberOfLabels - 1 && i < chartData.length) {
        xTicks.push({
          x: xScale(i),
          label: formatDateLabel(chartData[i].date),
        });
      }
    }

    // Always add the last date as the final tick
    if (chartData.length > 0) {
      xTicks.push({
        x: xScale(chartData.length - 1),
        label: formatDateLabel(chartData[chartData.length - 1].date),
      });
    }

    // Y-axis ticks based on the min and max values
    const yTickCount = 6; // Number of y-axis ticks (including zero)
    const yTicks = [];

    // Calculate y-ticks based on the abs max value
    const yTickStep = absMax / (yTickCount / 2);

    // Add positive ticks
    for (let i = 0; i <= yTickCount / 2; i++) {
      const value = i * yTickStep;
      if (value <= absMax) {
        yTicks.push({
          y: yScale(value),
          value: Math.round(value),
          label: value,
        });
      }
    }

    // Add negative ticks
    for (let i = 1; i <= yTickCount / 2; i++) {
      const value = -i * yTickStep;
      if (value >= -absMax) {
        yTicks.push({
          y: yScale(value),
          value: Math.round(value),
          label: value,
        });
      }
    }

    // Format large numbers for display
    const formatLargeNumber = (num) => {
      return new Intl.NumberFormat("en-IN").format(num);
    };

    const currentValue = chartData[chartData.length - 1].value;

    // Handler for mouse movement
    const handleMouseMove = (event) => {
      const svgElement = event.currentTarget;
      const rect = svgElement.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;

      // Calculate relative position considering viewBox
      const svgWidth = svgElement.clientWidth;
      const viewBoxWidth = width;
      const ratio = viewBoxWidth / svgWidth;

      const adjustedMouseX = mouseX * ratio;

      // Find the closest data point
      let closestIndex = 0;
      let closestDistance = Infinity;

      chartData.forEach((point, index) => {
        const pointX = xScale(index);
        const distance = Math.abs(adjustedMouseX - pointX);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Only update if close enough to the line (within 15px)
      if (closestDistance < 15 * ratio) {
        setHoverPoint({
          index: closestIndex,
          date: chartData[closestIndex].date,
          value: chartData[closestIndex].value,
          x: xScale(closestIndex),
          y: yScale(chartData[closestIndex].value),
        });
      } else {
        setHoverPoint(null);
      }
    };

    // Handler for mouse leave
    const handleMouseLeave = () => {
      setHoverPoint(null);
    };

    // Create paths for each segment, colored by trend
    const generateColoredPaths = () => {
      if (chartData.length < 2) return [];

      const segments = [];

      for (let i = 0; i < chartData.length - 1; i++) {
        const startX = xScale(i);
        const startY = yScale(chartData[i].value);
        const endX = xScale(i + 1);
        const endY = yScale(chartData[i + 1].value);

        // Determine color based on whether the value increases or decreases
        const isIncreasing = chartData[i + 1].value > chartData[i].value;

        segments.push({
          path: `M ${startX} ${startY} L ${endX} ${endY}`,
          color: isIncreasing ? "#2E7D32" : "#C62828", // Green for increasing, Red for decreasing
        });
      }

      return segments;
    };

    const pathSegments = generateColoredPaths();

    return (
      <div style={{ textAlign: "center" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownload}
          sx={{ display: "flex", justifyContent: "flex-start" }}
        >
          Download
        </Button>

        <div id="chart-container">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Title */}
            <text
              x={padding.left}
              y={19}
              style={{ fontSize: "24px", fontWeight: "bold" }}
            >
              DII Flows (Provisional)
            </text>

            {/* Subtitle */}
            <text
              x={padding.left}
              y={34}
              style={{ fontSize: "16px", fill: "#666" }}
            >
              (Rs Crore)
            </text>

            {/* Y-axis grid lines */}
            {yTicks.map((tick, i) => (
              <line
                key={`grid-${i}`}
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#eee"
                strokeWidth="1"
              />
            ))}

            {/* Zero line - make it more prominent */}
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={yScale(0)}
              y2={yScale(0)}
              stroke="#ccc"
              strokeWidth="1.5"
            />

            {/* Y-axis line */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={height - padding.bottom}
              stroke="#666"
              strokeWidth="1.5"
            />

            {/* X-axis line */}
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="#666"
              strokeWidth="1.5"
            />

            {/* Legend */}

            {/* Y-axis labels */}
            {yTicks.map((tick, i) => (
              <text
                key={`label-${i}`}
                x={padding.left - 10}
                y={tick.y}
                textAnchor="end"
                alignmentBaseline="middle"
                style={{ fontSize: "12px", fill: "#666" }}
              >
                {formatLargeNumber(tick.value)}
              </text>
            ))}

            {/* Render colored line segments */}
            {pathSegments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill="none"
                stroke={segment.color}
                strokeWidth="1.5"
              />
            ))}

            {/* Hover area - transparent overlay across the chart area */}
            <rect
              x={padding.left}
              y={padding.top}
              width={width - padding.left - padding.right}
              height={height - padding.top - padding.bottom}
              fill="transparent"
            />

            {/* X-axis labels - ADJUSTED FOR BETTER SPACING */}
            {xTicks.map((tick, i) => (
              <text
                key={i}
                x={tick.x}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                style={{ fontSize: "14px", fill: "#666" }}
              >
                {tick.label}
              </text>
            ))}

            {/* Y-axis title */}
            <text
              x={padding.left - 40}
              y={padding.top + (height - padding.top - padding.bottom) / 2}
              textAnchor="middle"
              transform={`rotate(-90, ${padding.left - 40}, ${
                padding.top + (height - padding.top - padding.bottom) / 2
              })`}
              style={{ fontSize: "19px", fill: "#666" }}
            >
              Rs Crore
            </text>

            {/* Current value display */}
            <text
              x={width - padding.right + 10}
              y={yScale(chartData[chartData.length - 1].value)}
              textAnchor="start"
              alignmentBaseline="middle"
              style={{ fontSize: "14px", fill: "#666" }}
            >
              Net (Rs Crore)
            </text>

            <text
              x={width - padding.right + 10}
              y={yScale(chartData[chartData.length - 1].value) + 20}
              textAnchor="start"
              alignmentBaseline="middle"
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                fill: currentValue >= 0 ? "#2E7D32" : "#C62828",
              }}
            >
              {currentValue}
            </text>

            {/* Hover effect - Dot marker */}
            {hoverPoint && (
              <>
                {/* Vertical line */}
                <line
                  x1={hoverPoint.x}
                  y1={padding.top}
                  x2={hoverPoint.x}
                  y2={height - padding.bottom}
                  stroke="#888"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />

                {/* Point marker */}
                <circle
                  cx={hoverPoint.x}
                  cy={hoverPoint.y}
                  r={5}
                  fill={hoverPoint.value >= 0 ? "#2E7D32" : "#C62828"}
                  stroke="#fff"
                  strokeWidth="2"
                />

                {/* Tooltip background */}
                <rect
                  x={hoverPoint.x + 10}
                  y={hoverPoint.y - 35}
                  width={180}
                  height={70}
                  rx={4}
                  ry={4}
                  fill="white"
                  stroke="#888"
                  strokeWidth="1"
                  opacity="0.95"
                />

                {/* Tooltip text - Date */}
                <text
                  x={hoverPoint.x + 20}
                  y={hoverPoint.y - 10}
                  style={{ fontSize: "14px", fontWeight: "bold" }}
                >
                  {formatDateFull(hoverPoint.date)}
                </text>

                {/* Tooltip text - Value */}
                <text
                  x={hoverPoint.x + 20}
                  y={hoverPoint.y + 15}
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    fill: hoverPoint.value >= 0 ? "#2E7D32" : "#C62828",
                  }}
                >
                  {hoverPoint.value >= 0 ? "+" : ""}
                  {hoverPoint.value.toFixed(2).toLocaleString("en-IN")} ₹ Cr.
                </text>
              </>
            )}

            {/* Use data URL for logo instead of path */}
            <image
              href={logoDataUrl || "../../images/logo.png"}
              x={width - padding.right - 90}
              y={height - 40}
              height="40"
              width="120"
              id="logo-image"
            />
          </svg>
        </div>
      </div>
    );
  };

  // FUND FLOW

  const FundFlow = ({ data }) => {
    const [logoImage, setLogoImage] = useState(null);
    const [logoDataUrl, setLogoDataUrl] = useState(null);
    const originalDate = data[0]["DATE"];
    const dateObj = new Date(originalDate);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });

    useEffect(() => {
      // Preload logo image and convert to data URL
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = "../../images/logo.png"; // Your logo path
      img.onload = () => {
        setLogoImage(img);

        // Convert the image to data URL immediately
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        setLogoDataUrl(dataUrl);
      };
    }, []);

    const handleDownload = () => {
      const chartElement = document.querySelector(".fund-flow-container");

      if (!chartElement) {
        console.error(
          "Could not find element with class 'fund-flow-container'"
        );
        return;
      }

      document.fonts.ready.then(() => {
        const clone = chartElement.cloneNode(true);
        clone.style.position = "absolute";
        clone.style.left = "-9999px";
        document.body.appendChild(clone);

        const dateBox = clone.querySelector(".date-box-solid");
        if (dateBox) {
          dateBox.style.backgroundColor = "#0e3d64d";
          dateBox.style.color = "white";
          dateBox.style.width = "180px";
          dateBox.style.height = "70px";
          dateBox.style.display = "flex";
          dateBox.style.justifyContent = "center";
          dateBox.style.alignItems = "center";
          dateBox.style.padding = "8px 16px";
          dateBox.style.borderRadius = "4px";
          dateBox.style.fontSize = "30px";
          dateBox.style.fontWeight = "800";
          dateBox.style.textAlign = "center";
          dateBox.style.paddingBottom = "70px";
        }

        const options = {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          imageTimeout: 0,
          logging: false,
          removeContainer: true,
        };

        html2canvas(clone, options)
          .then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = imgData;
            link.download = "FundFlow.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            document.body.removeChild(clone);
          })
          .catch((err) => {
            console.error("Error generating canvas:", err);
            document.body.removeChild(clone);
          });
      });
    };

    return (
      <>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownload}
          sx={{ display: "flex", justifyContent: "flex-start" }}
        >
          Download
        </Button>
        <div className="fund-flow-container">
          {/* Left section - blue background */}

          <div className="left-panel">
            <div className="title-container">
              <img
                width="300px"
                src="../../images/fundflow.png"
                alt="NDTVPROFIT"
              />
            </div>

            <div>
              <div className="date-box-solid">{formattedDate}</div>

              <div className="source-text">Source: NSE</div>
            </div>
          </div>

          {/* Right section - dark blue background */}
          <div className="right-panel">
            <div className="cash-market-title">CASH MARKET</div>

            <div className="market-row">
              <div style={{ fontWeight: "600" }}>
                FII Cash (NSE Provisional)
              </div>
              <div className="value-container">
                <div
                  className="arrow"
                  style={{
                    color:
                      data[0]["FII Cash - NSE Prov"] < 0 ? "red" : "lightgreen",
                  }}
                >
                  {data[0]["FII Cash - NSE Prov"] < 0 ? "▼" : "▲"}
                </div>
                <div className="value">{data[0]["FII Cash - NSE Prov"]}</div>
              </div>
            </div>

            <div className="market-row">
              <div style={{ fontWeight: "600" }}>DII Cash (NSE Actual)</div>
              <div className="value-container">
                <div
                  className="arrow"
                  style={{
                    color: data[1]["diiNetValue"] < 0 ? "red" : "lightgreen",
                  }}
                >
                  {data[1]["diiNetValue"] < 0 ? "▼" : "▲"}
                </div>
                <div className="value">{data[1]["diiNetValue"]}</div>
              </div>
            </div>

            <div className="separator"></div>
            <div className="FO">FUTURES & OPTIONS</div>

            <div className="market-row">
              <div></div>
              <div className="value-container">
                <div className="value">
                  Net(<span style={{ color: "red" }}>Short</span> /
                  <span style={{ color: "Lightgreen" }}>Long</span>)
                </div>

                <div className="value2">Open Interest</div>
              </div>
            </div>

            <div className="market-row">
              <div style={{ fontWeight: "600" }}>Nifty Futures</div>
              <div className="value-container">
                <div
                  className="value"
                  m
                  style={{
                    color:
                      data[0]["Net Nifty Fut (Buy/ Sell) - Rs Crore"] < 0
                        ? "red"
                        : "lightgreen",
                  }}
                >
                  {Number(
                    data[0]["Net Nifty Fut (Buy/ Sell) - Rs Crore"]
                  ).toFixed(2)}
                </div>
                <div className="value2">
                  {" "}
                  {data[0]["Nifty Futures OI - Rs Crore"]}
                </div>
              </div>
            </div>

            <div className="market-row">
              <div style={{ fontWeight: "600" }}>Nifty Bank Futures</div>
              <div className="value-container">
                <div
                  className="value"
                  style={{
                    color:
                      data[0]["Net Nifty Bank Fut - Rs Crore"] < 0
                        ? "red"
                        : "lightgreen",
                  }}
                >
                  {Number(data[0]["Net Nifty Bank Fut - Rs Crore"]).toFixed(2)}
                </div>
                <div className="value2"> {data[0]["Nifty Bank Fut OI"]}</div>
              </div>
            </div>

            <div className="market-row">
              <div style={{ fontWeight: "600" }}>Index Options</div>
              <div className="value-container">
                <div
                  className="value"
                  style={{
                    color:
                      data[0]["Net Index Option"] < 0 ? "red" : "lightgreen",
                  }}
                >
                  {Number(data[0]["Net Index Option"]).toFixed(2)}
                </div>
                <div className="value2">
                  {Number(data[0]["Net Index Option OI"]).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="market-row">
              <div style={{ fontWeight: "600" }}>Nifty Options</div>
              <div className="value-container">
                <div
                  className="value"
                  style={{
                    color:
                      data[0]["Nifty Net Options BUY/ SELL"] < 0
                        ? "red"
                        : "lightgreen",
                  }}
                >
                  {Number(data[0]["Nifty Net Options BUY/ SELL"]).toFixed(2)}
                </div>
                <div className="value2">
                  {Number(data[0]["Nifty Net Option OI"]).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="market-row">
              <div style={{ fontWeight: "600" }}>Stock Futures</div>
              <div className="value-container">
                <div
                  className="value"
                  style={{
                    color:
                      data?.[0]?.["Net Stock Futures"] < 0
                        ? "red"
                        : "lightgreen",
                  }}
                >
                  {data?.[0]?.["Net Stock Futures"] !== undefined
                    ? Number(data[0]["Net Stock Futures"]).toFixed(2)
                    : "N/A"}
                </div>
                <div className="value2">
                  {data?.[0]?.["Net Stocks Fut OI - Rs Crore"] !== undefined
                    ? Number(data[0]["Net Stocks Fut OI - Rs Crore"]).toFixed(2)
                    : "00.00"}
                </div>
              </div>
            </div>

            <div className="logo-container">
              <div className="logo">
                <Grid item>
                  <Tooltip title="Go to Home">
                    <Link to="/interested">
                      <img
                        width="100px"
                        src="../../images/logo.png"
                        alt="NDTVPROFIT"
                      />
                    </Link>
                  </Tooltip>
                </Grid>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // FII-DII FLOWS

  const FiiDiiFlows = ({ data }) => {
    const [logoImage, setLogoImage] = useState(null);
    const [logoDataUrl, setLogoDataUrl] = useState(null);

    const dateObj = new Date(FiiDate);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });

    console.log("InsideFiiDate", formattedDate)


   


    useEffect(() => {
      // Preload logo image and convert to data URL
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = "../../images/logo.png"; // Your logo path
      img.onload = () => {
        setLogoImage(img);

        // Convert the image to data URL immediately
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        setLogoDataUrl(dataUrl);
      };
    }, []);

    const handleDownload = () => {
      const chartElement = document.querySelector(".main-container2");

      if (!chartElement) {
        console.error("Could not find element with class 'main-container2'");
        return;
      }

      // Add loading indicator
      const loadingIndicator = document.createElement("div");
      loadingIndicator.textContent = "Generating image...";
      loadingIndicator.style.position = "fixed";
      loadingIndicator.style.top = "10px";
      loadingIndicator.style.right = "10px";
      loadingIndicator.style.padding = "10px";
      loadingIndicator.style.background = "rgba(0,0,0,0.7)";
      loadingIndicator.style.color = "white";
      loadingIndicator.style.borderRadius = "5px";
      loadingIndicator.style.zIndex = "9999";
      document.body.appendChild(loadingIndicator);

      // Wait for fonts to load
      document.fonts.ready.then(() => {
        // Create a deep clone of the element
        const clone = chartElement.cloneNode(true);
        clone.style.position = "absolute";
        clone.style.left = "-9999px";
        clone.style.width = chartElement.offsetWidth + "px";
        clone.style.height = chartElement.offsetHeight + "px";

        // Apply grid styles explicitly to ensure they're captured in the image
        const dataGrid = clone.querySelector(".data-grid");
        if (dataGrid) {
          Object.assign(dataGrid.style, {
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gridGap: "20px",
            padding: "20px",
            position: "absolute",
            top: "250px",
            left: "0",
            right: "0",
            bottom: "60px",
          });
        }

        // Style time boxes
        const timeBoxes = clone.querySelectorAll(".time-box");
        timeBoxes.forEach((box) => {
          Object.assign(box.style, {
            backgroundColor: "white",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            height: "100%",
            alignItems: "center",
            paddingBottom: "10px",
          });
        });

        // Style time headers
        const timeHeaders = clone.querySelectorAll(".time-header");
        timeHeaders.forEach((header) => {
          Object.assign(header.style, {
            backgroundColor: "#3b5998",
            color: "white",
            paddingBottom: "25px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "22px", // Using fixed size instead of clamp for better compatibility
          });

          // Ensure the text content is preserved
          if (header.textContent.trim() === "") {
            const originalIndex = Array.from(timeHeaders).indexOf(header);
            const originalHeaders =
              chartElement.querySelectorAll(".time-header");
            if (originalHeaders[originalIndex]) {
              header.textContent = originalHeaders[originalIndex].textContent;
            }
          }
        });

        // Style flow data containers
        const flowData = clone.querySelectorAll(".flow-data");
        flowData.forEach((data) => {
          Object.assign(data.style, {
            paddingBottom: "10px",
            color: "black",
          });
        });

        // Style data items
        const dataItems = clone.querySelectorAll(".data-item");
        dataItems.forEach((item) => {
          Object.assign(item.style, {
            display: "flex",
            justifyContent: "space-between",
            fontSize: "14px", // Using fixed size instead of clamp
          });
        });

        // Style labels
        const labels = clone.querySelectorAll(".label");
        labels.forEach((label) => {
          Object.assign(label.style, {
            fontWeight: "bold",
            fontSize: "25px",
          });
        });

        // Style values
        const values = clone.querySelectorAll(".value");
        values.forEach((value) => {
          value.style.textAlign = "right";
        });

        // Style value3
        const value3s = clone.querySelectorAll(".value3");
        value3s.forEach((value3) => {
          Object.assign(value3.style, {
            fontSize: "27px",
            fontWeight: "bold",
          });
        });

        const FiiValue = clone.querySelectorAll(".data-cell");
        FiiValue.forEach((value3) => {
          Object.assign(value3.style, {
            flex: "1",
            paddingBottom: "60px",

            textAlign: "center",
            borderRight: "1px solid #eee",
            fontSize: "26px",
            fontWeight: "bold",
          });
        });

        const headercellfii = clone.querySelectorAll(".header-cell");
        headercellfii.forEach((value3) => {
          Object.assign(value3.style, {
            paddingBottom: "40px",

            fontSize: "20px",
          });
        });

        document.body.appendChild(clone);

        // Force layout recalculation
        void clone.offsetHeight;

        const options = {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          imageTimeout: 5000,
          logging: true,
          removeContainer: true,
          onclone: function (clonedDoc) {
            // Additional opportunity to modify the cloned document if needed
          },
        };

        html2canvas(clone, options)
          .then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = imgData;
            link.download = "FundFlow.png";
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            document.body.removeChild(clone);
            document.body.removeChild(loadingIndicator);
          })
          .catch((err) => {
            console.error("Error generating canvas:", err);
            document.body.removeChild(clone);
            document.body.removeChild(loadingIndicator);
            alert("Failed to generate image. Check console for details.");
          });
      });
    };

    return (
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownload}
          sx={{ display: "flex", justifyContent: "flex-start" }}
        >
          Download
        </Button>

        <div className="main-container2">

       
    
        <div className="market-data-container">
            
            <div className="header-row">
              <div className="header-cell">
                FII  <span className="currency"> (₹ Cr) (  {formattedDate})</span>
              </div>
              <div className="header-cell">
                DII <span className="currency"> (₹ Cr)  (  {formattedDate})</span>
              </div>
              <div className="header-cell blink">Nifty50 (% Chg) (Current)</div>

            </div>

            <div className="data-row">
              <div className="data-cell">
                <span
                  style={{ color: FiiDii[0].fiiNetValue > 0 ? "green" : "red" }}
                >
                  {FiiDii[0]?.fiiNetValue?.toLocaleString('en-IN')}

                </span>
              </div>
              <div className="data-cell">
                <span
                  style={{ color: FiiDii[0].diiNetValue > 0 ? "green" : "red" }}
                >
                  {FiiDii[0]?.diiNetValue?.toLocaleString('en-IN')} 
                </span>
              </div>
              <div
                className="data-cell"
                style={{ color: NiftyPrice?.changePerc > 0 ? "green" : "red" }}
              >
                {NiftyPrice?.lastPrice?.toLocaleString()} ({(NiftyPrice?.changePerc).toFixed(2)}%)
              </div>
            </div>
          </div>

          <div className="data-grid">
            <div className="time-box">
              <div className="time-header">1 Week</div>
              <div className="flow-data">
                <div className="data-item">
                  <span className="label">FII (₹ Cr):</span>
                  <span className="value3" style = {{color:  data?.FiiDiiFlowsData[0].total_fii_net_value > 0 ? "green" : "red" }}>
                  {Number(data?.FiiDiiFlowsData[0]?.total_fii_net_value || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">DII (₹ Cr):</span>
                  <span className="value3" style = {{color:  data?.FiiDiiFlowsData[0].total_dii_net_value > 0 ? "green" : "red"}}>
                    {Number(
                      data?.FiiDiiFlowsData[0].total_dii_net_value
                      || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">Nifty50 (% Chg):</span>
                  <span className="value3" style = {{color:  data?.FiiDiiFlowsData[0].nifty_value > 0 ? "green" : "red"}}>
                    {Number(data?.FiiDiiFlowsData[0].nifty_value).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="time-box">
              <div className="time-header">1 Month</div>
              <div className="flow-data">
                <div className="data-item">
                  <span className="label">FII (₹ Cr):</span>
                  <span className="value3" style = {{color:  data?.FiiDiiFlowsData[1].total_fii_net_value > 0 ? "green" : "red"}}>
                    {Number(
                      data?.FiiDiiFlowsData[1].total_fii_net_value|| 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">DII (₹ Cr):</span>
                  <span className="value3" style = {{color:   data?.FiiDiiFlowsData[1].total_dii_net_value > 0 ? "green" : "red"}}>
                    {Number(
                      data?.FiiDiiFlowsData[1].total_dii_net_value|| 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">Nifty50 (% Chg):</span>
                  <span className="value3" style = {{color:   data?.FiiDiiFlowsData[1].nifty_value > 0 ? "green" : "red"}}>
                    {Number(data?.FiiDiiFlowsData[1].nifty_value).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="time-box">
              <div className="time-header">3 Months</div>
              <div className="flow-data">
                <div className="data-item">
                  <span className="label">FII (₹ Cr):</span>
                  <span className="value3" style = {{color:   data?.FiiDiiFlowsData[2].total_fii_net_value > 0 ? "green" : "red"}}>
                    {Number(
                      data?.FiiDiiFlowsData[2].total_fii_net_value|| 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">DII (₹ Cr):</span>
                  <span className="value3" style = {{color:    data?.FiiDiiFlowsData[2].total_dii_net_value > 0 ? "green" : "red"}}>
                    {Number(
                      data?.FiiDiiFlowsData[2].total_dii_net_value|| 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">Nifty50 (% Chg):</span>
                  <span className="value3" style = {{color:   data?.FiiDiiFlowsData[2].nifty_value > 0 ? "green" : "red"}}>
                    {Number(data?.FiiDiiFlowsData[2].nifty_value).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="time-box">
              <div className="time-header">6 Months</div>
              <div className="flow-data">
                <div className="data-item">
                  <span className="label">FII (₹ Cr):</span>
                  <span className="value3" style = {{color:   data?.FiiDiiFlowsData[3].total_fii_net_value > 0 ? "green" : "red"}}>
                    {Number(
                      data?.FiiDiiFlowsData[3].total_fii_net_value|| 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">DII (₹ Cr):</span>
                  <span className="value3" style = {{color:data?.FiiDiiFlowsData[3].total_dii_net_value > 0 ? "green" : "red"}}>
                    {Number(
                      data?.FiiDiiFlowsData[3].total_dii_net_value|| 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">Nifty50 (% Chg):</span>
                  <span className="value3" style = {{color:data?.FiiDiiFlowsData[3].nifty_value > 0 ? "green" : "red"}}>
                    {Number(data?.FiiDiiFlowsData[3].nifty_value|| 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
              </div>
            </div>

            <div className="time-box">
              <div className="time-header">YTD</div>
              <div className="flow-data">
                <div className="data-item">
                  <span className="label">FII (₹ Cr):</span>
                  <span className="value3" style = {{color:  data?.FiiDiiFlowsData[5].total_fii_net_value > 0 ? "green" : "red"}}>
                    {Number(
                      data?.FiiDiiFlowsData[5].total_fii_net_value|| 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">DII (₹ Cr):</span>
                  <span className="value3"  style = {{color: data?.FiiDiiFlowsData[5].total_dii_net_value> 0 ? "green" : "red"}}>
                    {Number(
                      data?.FiiDiiFlowsData[5].total_dii_net_value|| 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">Nifty50 (% Chg):</span>
                  <span className="value3" style = {{color: data?.FiiDiiFlowsData[5].nifty_value > 0 ? "green" : "red"}}>
                    {Number(data?.FiiDiiFlowsData[5].nifty_value|| 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
              </div>
            </div>

            <div className="time-box">
              <div className="time-header">1 Year</div>
              <div className="flow-data">
                <div className="data-item">
                  <span className="label">FII (₹ Cr):</span>
                  <span className="value3 " style = {{color:  data?.FiiDiiFlowsData[4].total_fii_net_value > 0 ? "green" : "red"}}>
                    {Number(
                      data?.FiiDiiFlowsData[4].total_fii_net_value|| 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">DII (₹ Cr):</span>
                  <span className="value3" style = {{color: data?.FiiDiiFlowsData[4].total_dii_net_value > 0 ? "green" : "red"}}>
                    {Number(
                      data?.FiiDiiFlowsData[4].total_dii_net_value|| 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">Nifty50 (% Chg):</span>
                  <span className="value3" style = {{color: data?.FiiDiiFlowsData[4].nifty_value > 0 ? "green" : "red"}}>
                    {Number(data?.FiiDiiFlowsData[4].nifty_value|| 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>

      {/* Header */}
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
              <strong>FII DII Activity</strong>
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
          <Box
            sx={{
              height: 700,
              "& .super-app-theme--header": {
                backgroundColor: "#1A237E",
                color: "white",
                fontWeight: "600",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              },
              "& .data-grid-cell": {
                fontSize: "13px",
                fontWeight: "500",
              },
              "& .MuiDataGrid-row:nth-of-type(even)": {
                backgroundColor: "#F5F7FF",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#E8EAF6 !important",
              },
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-columnSeparator": {
                display: "none",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: "#E8EAF6",
                borderTop: "none",
              },
              "& .MuiTablePagination-root": {
                color: "#1A237E",
              },
              "& .MuiDataGrid-toolbarContainer": {
                backgroundColor: "#E8EAF6",
                padding: "8px 16px",
                borderBottom: "1px solid #E0E0E0",
              },
              "& .MuiButton-text": {
                color: "#1A237E",
              },
              boxShadow: "0 4px 20px 0 rgba(0,0,0,0.12)",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #E0E0E0",
            }}
          >
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                }}
              >
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{ color: "#1A237E" }}
                />
              </Box>
            ) : (
              <DataGrid
                rows={FiiDii}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                loading={loading}
                sx={{
                  "& .MuiDataGrid-main": {
                    width: "fit-content",
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    scrollbarWidth: "thin",
                    "&::-webkit-scrollbar": {
                      width: "6px",
                      height: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#1A237E",
                      borderRadius: "3px",
                    },
                  },
                }}
                components={{
                  Toolbar: () => (
                    <>
                      <StyledToolbarContainer>
                        <CustomToolbar/>
                        <CustomToolbar3/>
                        <CustomToolbar4/>
                        <CustomToolbar2/>
                        <CustomToolbar5/>
                      </StyledToolbarContainer>
                      <GridToolbar />
                    </>
                  ),
                }}
                componentsProps={{
                  toolbar: {
                    sx: {
                      "& .MuiButton-root": {
                        minWidth: "36px",
                        padding: "6px",
                        margin: "0 4px",
                        "&:hover": {
                          backgroundColor: "#C5CAE9",
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </Box>



      {/* SHOW TREND */}
      <Dialog
        open={openChart}
        onClose={() => setOpenChart(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6"></Typography>
          <IconButton
            aria-label="close"
            onClick={() => setOpenChart(false)}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 500, mt: 2 }}>
            {FiiDii.length > 0 ? (
              <NDTVStyleChart data={FiiDii} />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
      {/* FUND FLOW TREND */}
      <Dialog
        open={fundFlow}
        onClose={() => setFundFlow(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6"></Typography>
          <IconButton
            aria-label="close"
            onClick={() => setFundFlow(false)}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ height: 600, mt: 2 }}>
            <FundFlow data={filteredData} />
          </Box>
        </DialogContent>
      </Dialog>

      ;{/* FII VALUE */}
      <Dialog
        open={openfiiTrend}
        onClose={() => setOpenFiiTrend(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6"></Typography>
          <IconButton
            aria-label="close"
            onClick={() => setOpenFiiTrend(false)}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ height: 500, mt: 2 }}>
            {FiiDii?.length > 0 ? (
              <FiiTrend data={FiiDii} />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      ;{/* DII VALUE */}
      <Dialog
        open={openDiiTrend}
        onClose={() => setOpenDiiTrend(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6"></Typography>
          <IconButton
            aria-label="close"
            onClick={() => setOpenDiiTrend(false)}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ height: 500, mt: 2 }}>
            {FiiDii?.length > 0 ? (
              <DiiTrend data={FiiDii} />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* FII-DII FLOWS */}
      <Dialog
        open={openFiIDiiFlows}
        onClose={() => setopenFiIDiiFlows(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6"></Typography>
          <IconButton
            aria-label="close"
            onClick={() => setopenFiIDiiFlows(false)}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ height: 750 }}>
            {FiiDiiFlowsData?.length > 0 ? (
              <FiiDiiFlows data={{ FiiDiiFlowsData }} />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
      
    </Box>
  );
};

export default FIIDII;
