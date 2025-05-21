import React, { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { apiConfig } from "../../commonApi/apiConfig";
import Cookies from "js-cookie";
import "./index.scss";
import { useNavigate } from "react-router";
import html2canvas from "html2canvas";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from '@mui/material/styles'; // Import styled
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

const Client = () => {
const [token, setToken] = useState(() => Cookies.get("token") || "");
const navigate = useNavigate();
  const [data, setData] = useState([]);
    const [openChart, setOpenChart] = useState(false);

  // Add ID to each row as MUI DataGrid requires a unique identifier
  const rowsWithId = data.map((row, index) => ({
    id: index,
    ...row
  }));



 useEffect(() => {
    const tokenFromCookies = Cookies.get("token");
    if (tokenFromCookies) {
      setToken(tokenFromCookies);
    } else {
      navigate("/");
    }
  }, [navigate]);


  
    useEffect(() => {
      if (token) {  // Only fetch data if token exists
        clients();
      }
    }, [token]);  // Add token as dependency



     const clients = async () => {
        const getFuturesEndpoint = `getDerivativesparticipants`;
        try {
          const response = await apiConfig(`${getFuturesEndpoint}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setData(response);
        } catch (error) {
          if (token === "") {
            Cookies.remove("token");
            Cookies.remove("email");
            navigate("/");
          }
          setData([]);
          console.error(error);
        }
      };


  // Format number values
  const formatNumber = (value) => {
    if (value === null) return '-';
    if (typeof value !== 'number') return value;
    return value.toLocaleString('en-IN', {
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });
  };

  // Get cell class for positive/negative values
  const getCellClass = (params) => {
    if (typeof params.value !== 'number') return '';
    return params.value > 0 ? 'positive-value' : params.value < 0 ? 'negative-value' : '';
  };

  // Corrected columns to match the actual data fields
  const columns = [
    {
        field: 'DATE',
        headerName: 'Date',
        width: 120,
        align: 'left',
        headerAlign: 'left',
        valueFormatter: (params) => {
          if (!params.value) return '';
          // Assuming DATE comes as a string in ISO format or Date object
          const date = new Date(params.value);
          // Check if date is valid
          if (isNaN(date.getTime())) return params.value;
          // Format to dd-mm-yyyy
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        }
      },
    {
      field: 'Net Index Futures FII',
      headerName: 'Net Index Futures FII',
      type: 'number',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'FII Index Long %',
      headerName: 'FII Index Long %',
      type: 'number',
      width: 160,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'FII Index Short %',
      headerName: 'FII Index Short %',
      type: 'number',
      width: 160,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'FII Index Fut Long Short Ratio',
      headerName: 'FII Index Fut Long Short Ratio',
      type: 'number',
      width: 220,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'FII Fut Long Additions',
      headerName: 'FII Fut Long Additions',
      type: 'number',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'FII Fut Short Additions',
      headerName: 'FII Fut Short Additions',
      type: 'number',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Net Index Futures DII',
      headerName: 'Net Index Futures DII',
      type: 'number',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Net Index Futures Client',
      headerName: 'Net Index Futures Client',
      type: 'number',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Net Index Futures Prop',
      headerName: 'Net Index Futures Prop',
      type: 'number',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'FII Net Index Call OI',
      headerName: 'FII Net Index Call OI',
      type: 'number',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'FII Net Index Put OI',
      headerName: 'FII Net Index Put OI',
      type: 'number',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'FII Index Futures Long %',
      headerName: 'FII Index Futures Long %',
      type: 'number',
      width: 200,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'FII Index Futures Short %',
      headerName: 'FII Index Futures Short %',
      type: 'number',
      width: 200,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },

    {
      field: 'FII Net OI PCR',
      headerName: 'FII Net OI PCR',
      type: 'number',
      width: 160,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
  ];


  const CustomToolbar = () => (
    <Grid container justifyContent="space-between" alignItems="center" sx={{margin:"5px"}}>
      <GridToolbar />
      <Button 
        variant="contained" 
        onClick={() => setOpenChart(true)}
        sx={{ 
          backgroundColor: '#1A237E', 
          color: 'white',
          marginRight: 2,
          '&:hover': { backgroundColor: '#303F9F' }
        }}
      >
        Show Trend
      </Button>
    </Grid>
  );

  const StyledToolbarContainer = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  });

  const NDTVStyleChart = ({ data }) => {
    const [hoverPoint, setHoverPoint] = useState(null);
    const [logoImage, setLogoImage] = useState(null);
    const [logoDataUrl, setLogoDataUrl] = useState(null);
    
    useEffect(() => {
        // Preload logo image and convert to data URL
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = "../../images/logo.png";  // Your logo path
        img.onload = () => {
            setLogoImage(img);
            
            // Convert the image to data URL immediately
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            setLogoDataUrl(dataUrl);
        };
    }, []);
    
    if (!data || data.length === 0) return null;
    
    // Sort data by date (ascending) for charting
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const width = 1000;
    const height = 500;  // Increased height to reduce overlap
    const padding = { top: 80, right: 100, bottom: 120, left: 90 }; // Increased padding all around
    
    // Extract both datasets for charting - SWAPPED VALUES HERE
    const chartData = sortedData.map(item => ({
      date: new Date(item.DATE),
      futLongShortRatio: item["FII Index Fut Long Short Ratio"],
      oiPcr: item["FII Net OI PCR"] 
    }));
    
    // Function to capture and download graph
    const handleDownload = () => {
        const chartElement = document.getElementById("chart-container");
        
        // Before capturing, make sure we're using the data URL version of the logo
        const svgElement = chartElement.querySelector('svg');
        const imgElement = svgElement.querySelector('#logo-image');
        if (imgElement && logoDataUrl) {
            imgElement.setAttribute('href', logoDataUrl);
        }
    
        // Configuration for better image quality and handling external resources
        const options = {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        };
    
        html2canvas(chartElement, options).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = imgData;
            link.download = "FIIFNO.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    // Find min and max for scaling - OI PCR (right axis)
    const oiPcrValues = chartData.map(d => d.oiPcr);
    const minOiPcr = Math.min(...oiPcrValues);
    const maxOiPcr = Math.max(...oiPcrValues);
    // Use absolute min and max for OI PCR (no need to center around zero)
    const oiPcrMin = minOiPcr * 0.9; // Add some margin
    const oiPcrMax = maxOiPcr * 1.1; // Add some margin
    
    // Find min and max for scaling - Long Short Ratio (left axis)
    const lsrValues = chartData.map(d => d.futLongShortRatio);
    const minLsr = Math.min(...lsrValues);
    const maxLsr = Math.max(...lsrValues);
    // Round to nearest 0.1 for LSR
    const lsrMin = Math.floor(minLsr * 10) / 10 - 0.1; // Add some margin
    const lsrMax = Math.ceil(maxLsr * 10) / 10 + 0.1; // Add some margin
    
    // Scale functions
    const xScale = (index) => {
      return padding.left + (index / (chartData.length - 1)) * (width - padding.left - padding.right);
    };
    
    // Right Y-Axis scale for OI PCR - normal scale without centering on zero
    const yScaleOiPcr = (value) => {
      return padding.top + (height - padding.top - padding.bottom) * (1 - (value - oiPcrMin) / (oiPcrMax - oiPcrMin));
    };
    
    // Left Y-Axis scale for Long Short Ratio - normal scale
    const yScaleLsr = (value) => {
      return padding.top + (height - padding.top - padding.bottom) * (1 - (value - lsrMin) / (lsrMax - lsrMin));
    };
    
    // Format date for display in tooltip
    const formatDateFull = (date) => {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-IN', options);
    };
    
    // Format date labels for x-axis
    const formatDateLabel = (date) => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };
    
    // Select a reasonable number of x-axis labels to display
    const numberOfLabels = 5;
    const step = Math.floor(chartData.length / (numberOfLabels - 1));
    const xTicks = [];
    
    // Add evenly spaced ticks
    for (let i = 0; i < chartData.length; i += step) {
      if (xTicks.length < numberOfLabels - 1 && i < chartData.length) {
        xTicks.push({
          x: xScale(i),
          label: formatDateLabel(chartData[i].date)
        });
      }
    }
    
    // Always add the last date as the final tick
    if (chartData.length > 0) {
      xTicks.push({
        x: xScale(chartData.length - 1),
        label: formatDateLabel(chartData[chartData.length - 1].date)
      });
    }
    
    // Create ticks for left Y-axis (Long Short Ratio)
    const lsrTicks = [];
    const lsrTickCount = 5;
    const lsrStep = (lsrMax - lsrMin) / (lsrTickCount - 1);
    
    for (let i = 0; i < lsrTickCount; i++) {
      const value = lsrMin + i * lsrStep;
      lsrTicks.push({
        y: yScaleLsr(value),
        label: value.toFixed(2)
      });
    }
    
    // Create ticks for right Y-axis (OI PCR)
    const oiPcrTicks = [];
    const oiPcrTickCount = 5;
    const oiPcrStep = (oiPcrMax - oiPcrMin) / (oiPcrTickCount - 1);
    
    for (let i = 0; i < oiPcrTickCount; i++) {
      const value = oiPcrMin + i * oiPcrStep;
      oiPcrTicks.push({
        y: yScaleOiPcr(value),
        label: value.toFixed(2)
      });
    }
    
    // Get current values for display
    const currentOiPcr = chartData[chartData.length - 1].oiPcr.toFixed(2);
    const currentLsr = chartData[chartData.length - 1].futLongShortRatio.toFixed(2);
    
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
          oiPcr: chartData[closestIndex].oiPcr,
          futLongShortRatio: chartData[closestIndex].futLongShortRatio,
          x: xScale(closestIndex),
          yOiPcr: yScaleOiPcr(chartData[closestIndex].oiPcr),
          yLsr: yScaleLsr(chartData[closestIndex].futLongShortRatio)
        });
      } else {
        setHoverPoint(null);
      }
    };
    
    // Handler for mouse leave
    const handleMouseLeave = () => {
      setHoverPoint(null);
    };
    
    // Create paths for Long Short Ratio segments, colored by trend (green/red)
    const generateLsrPaths = () => {
      if (chartData.length < 2) return [];
      
      const segments = [];
      
      for (let i = 0; i < chartData.length - 1; i++) {
        const startX = xScale(i);
        const startY = yScaleLsr(chartData[i].futLongShortRatio);
        const endX = xScale(i + 1);
        const endY = yScaleLsr(chartData[i + 1].futLongShortRatio);
        
        // Determine color based on trend - green for increasing, red for decreasing
        const isIncreasing = chartData[i + 1].futLongShortRatio > chartData[i].futLongShortRatio;
        
        segments.push({
          path: `M ${startX} ${startY} L ${endX} ${endY}`,
          color: isIncreasing ? "#2E7D32" : "#2E7D32" // Green for increasing, Red for decreasing
        });
      }
      
      return segments;
    };
    
    // Create path for OI PCR, solid black line
    const generateOiPcrPath = () => {
      if (chartData.length < 2) return '';
      
      let path = `M ${xScale(0)} ${yScaleOiPcr(chartData[0].oiPcr)}`;
      
      for (let i = 1; i < chartData.length; i++) {
        path += ` L ${xScale(i)} ${yScaleOiPcr(chartData[i].oiPcr)}`;
      }
      
      return path;
    };
    
    const lsrPathSegments = generateLsrPaths();
    const oiPcrPath = generateOiPcrPath();
    
    return (
        <div style={{ textAlign: "center" }}>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleDownload} 
                sx={{display:'flex', justifyContent:'flex-start', marginTop:'20px'}}
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
                    <text x={padding.left} y={25} style={{ fontSize: '20px', fontWeight: 'bold' }}>
                      FII In Nifty Futures
                    </text>
                    
                    {/* Left Y-axis (Long Short Ratio) */}
                    <line 
                      x1={padding.left} 
                      y1={padding.top} 
                      x2={padding.left} 
                      y2={height - padding.bottom} 
                      stroke="#666" 
                      strokeWidth="1"
                    />
                    
                    {/* Right Y-axis (OI PCR) */}
                    <line 
                      x1={width - padding.right} 
                      y1={padding.top} 
                      x2={width - padding.right} 
                      y2={height - padding.bottom} 
                      stroke="#666" 
                      strokeWidth="1"
                    />
                    
                    {/* Left Y-axis label */}
                    <text 
                      transform={`translate(${padding.left - 65}, ${padding.top + (height - padding.top - padding.bottom) / 2}) rotate(-90)`}
                      textAnchor="middle" 
                      style={{ fontSize: '14px', fill: 'green', fontWeight: 'bold' }}
                    >
                      FII Index Fut Long Short Ratio
                    </text>
                    
                    {/* Left Y-axis ticks */}
                    {lsrTicks.map((tick, i) => (
                      <g key={`lsr-tick-${i}`}>
                        <line 
                          x1={padding.left - 5} 
                          y1={tick.y} 
                          x2={padding.left} 
                          y2={tick.y} 
                          stroke="green" 
                          strokeWidth="1"
                        />
                        <text 
                          x={padding.left - 10} 
                          y={tick.y} 
                          textAnchor="end" 
                          alignmentBaseline="middle"
                          style={{ fontSize: '12px', fill: 'green' }}
                        >
                          {tick.label}
                        </text>
                        
                        {/* Horizontal grid line */}
                        <line 
                          x1={padding.left} 
                          y1={tick.y} 
                          x2={width - padding.right} 
                          y2={tick.y} 
                          stroke="#eee" 
                          strokeWidth="1"
                        />
                      </g>
                    ))}
                    
                    {/* Right Y-axis label */}
                    <text 
                      transform={`translate(${width - padding.right + 65}, ${padding.top + (height - padding.top - padding.bottom) / 2}) rotate(90)`}
                      textAnchor="middle" 
                      style={{ fontSize: '14px', fill: '#000', fontWeight: 'bold' }}
                    >
                      FII Net OI PCR
                    </text>
                    
                    {/* Right Y-axis ticks */}
                    {oiPcrTicks.map((tick, i) => (
                      <g key={`oi-pcr-tick-${i}`}>
                        <line 
                          x1={width - padding.right} 
                          y1={tick.y} 
                          x2={width - padding.right + 5} 
                          y2={tick.y} 
                          stroke="#666" 
                          strokeWidth="1"
                        />
                        <text 
                          x={width - padding.right + 10} 
                          y={tick.y} 
                          textAnchor="start" 
                          alignmentBaseline="middle"
                          style={{ fontSize: '12px', fill: '#666' }}
                        >
                          {tick.label}
                        </text>
                      </g>
                    ))}
                    
                    {/* Render OI PCR Value - black line */}
                    <path 
                      d={oiPcrPath} 
                      fill="none" 
                      stroke="#000" 
                      strokeWidth="1.5"
                    />
                    
                    {/* Render Long Short Ratio colored line segments */}
                    {lsrPathSegments.map((segment, index) => (
                      <path 
                        key={`lsr-segment-${index}`}
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
                    
                    {/* X-axis */}
                    <line 
                      x1={padding.left} 
                      x2={width - padding.right} 
                      y1={height - padding.bottom} 
                      y2={height - padding.bottom} 
                      stroke="#666" 
                      strokeWidth="1"
                    />
                    
                    {/* X-axis labels - staggered to avoid overlap */}
                    {xTicks.map((tick, i) => (
                      <text 
                        key={`x-tick-${i}`} 
                        x={tick.x} 
                        y={height - padding.bottom + 20} 
                        textAnchor="middle" 
                        style={{ fontSize: '14px', fill: '#666' }}
                      >
                        {tick.label}
                      </text>
                    ))}
                    
                    {/* Legend */}
                    <g transform={`translate(${width - padding.right - 170}, 20)`}>
                      {/* OI PCR legend - BLACK
                      <line x1="0" y1="0" x2="20" y2="0" stroke="#000" strokeWidth="1.5" />
                      <text x="25" y="5" style={{ fontSize: '14px', fill: '#000' }}>
                        FII Net OI PCR
                      </text>
                      
                      {/* Increasing legend - GREEN */}
                      {/* <line x1="0" y1="20" x2="20" y2="20" stroke="#2E7D32" strokeWidth="1.5" />
                      <text x="25" y="25" style={{ fontSize: '14px', fill: '#2E7D32' }}>
                        Fut Long (POSITIVE)
                      </text> */}
                      
                      {/* Decreasing legend - RED */}
                      {/* <line x1="0" y1="40" x2="20" y2="40" stroke="#C62828" strokeWidth="1.5" />
                      <text x="25" y="45" style={{ fontSize: '14px', fill: '#C62828' }}>
                      Fut Short (NEGATIVE)
                      </text>  */}
                    </g>
                    
                    {/* Current values display */}
                    {/* OI PCR (right) - BLACK */}
                    <text 
                      x={padding.left} 
                      y={padding.top - 23}
                      textAnchor="start" 
                      style={{ fontSize: '13px', fontWeight: 'bold', fill: '#000' }}
                    >
                      FII Net OI PCR: {currentOiPcr ? Number(currentOiPcr).toLocaleString('en-IN') : '0'} ({chartData.length > 0 ? chartData[chartData.length - 1].date.toLocaleDateString('en-IN') : 'N/A'})
                    </text> 

                    {/* Long Short Ratio (left) - DYNAMIC COLOR */}
                    <text 
                      x={padding.left + 256} 
                      y={padding.top - 39}
                      textAnchor="end" 
                      style={{ 
                        fontSize: '13px', 
                        fontWeight: 'bold', 
                        fill: chartData.length >= 2 && 
                              chartData[chartData.length - 1].futLongShortRatio > 
                              chartData[chartData.length - 2].futLongShortRatio ? 
                              "#2E7D32" : "#C62828" 
                      }}
                    >
                      FII Index Fut Long Short Ratio: {Number(currentLsr).toLocaleString('en-IN')} ({chartData.length > 0 ? chartData[chartData.length - 1].date.toLocaleDateString('en-IN') : 'N/A'})
                    </text>
                    
                    {/* Hover effect */}
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
                        
                        {/* Point markers */}
                        {/* Long Short Ratio marker - DYNAMIC COLOR */}
                        <circle 
                          cx={hoverPoint.x}
                          cy={hoverPoint.yLsr}
                          r={5}
                          fill={hoverPoint.index > 0 && 
                                hoverPoint.futLongShortRatio > chartData[hoverPoint.index - 1].futLongShortRatio ? 
                                "#2E7D32" : "#C62828"}
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        
                        {/* OI PCR marker - BLACK */}
                        <circle 
                          cx={hoverPoint.x}
                          cy={hoverPoint.yOiPcr}
                          r={5}
                          fill="#000"
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        
                        {/* Tooltip background */}
                        <rect 
                          x={hoverPoint.x - 110}
                          y={Math.min(height - padding.bottom - 100, Math.max(padding.top, (hoverPoint.yLsr + hoverPoint.yOiPcr)/2 - 45))}
                          width={220}
                          height={90}
                          rx={4}
                          ry={4}
                          fill="white"
                          stroke="#888"
                          strokeWidth="1"
                          opacity="0.95"
                        />
                        
                        {/* Tooltip text - Date */}
                        <text 
                          x={hoverPoint.x}
                          y={Math.min(height - padding.bottom - 100, Math.max(padding.top, (hoverPoint.yLsr + hoverPoint.yOiPcr)/2 - 45)) + 20}
                          textAnchor="middle"
                          style={{ fontSize: '14px', fontWeight: 'bold' }}
                        >
                          {formatDateFull(hoverPoint.date)}
                        </text>
                        
                        {/* Tooltip text - OI PCR - BLACK */}
                        <text 
                          x={hoverPoint.x}
                          y={Math.min(height - padding.bottom - 100, Math.max(padding.top, (hoverPoint.yLsr + hoverPoint.yOiPcr)/2 - 45)) + 45}
                          textAnchor="middle"
                          style={{ fontSize: '14px', fontWeight: 'bold', fill: '#000' }}
                        >
                          FII Net OI PCR: {hoverPoint.oiPcr.toFixed(2).toLocaleString('en-IN')}
                        </text>
                        
                        {/* Tooltip text - Long Short Ratio - DYNAMIC COLOR */}
                        <text 
                          x={hoverPoint.x}
                          y={Math.min(height - padding.bottom - 100, Math.max(padding.top, (hoverPoint.yLsr + hoverPoint.yOiPcr)/2 - 45)) + 70}
                          textAnchor="middle"
                          style={{ 
                            fontSize: '14px', 
                            fontWeight: 'bold', 
                            fill: hoverPoint.index > 0 && 
                                  hoverPoint.futLongShortRatio > chartData[hoverPoint.index - 1].futLongShortRatio ? 
                                  "#2E7D32" : "#C62828"
                          }}
                        >
                          FII Index Fut L/S Ratio: {hoverPoint.futLongShortRatio.toFixed(2).toLocaleString('en-IN')}
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

  return (
    <div style={{ height: 500, width: '100%' }}>
      <style>
        {`
          .positive-value {
            color: #2e7d32;
            font-weight: 800;
          }
          .negative-value {
            color: #d32f2f;
            font-weight: 800;
          }
          .MuiDataGrid-columnHeaders {
            background-color: #f5f5f5;
            font-weight: bold;
          }
        `}
      </style>
      <DataGrid
        rows={rowsWithId}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 100 },
          },
          sorting: {
            sortModel: [{ field: 'DATE', sort: 'desc' }],
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection={false}
        disableRowSelectionOnClick
        components={{
          Toolbar: () => (
              <>
             
              <StyledToolbarContainer>
             
                <CustomToolbar />
             
              </StyledToolbarContainer>
             
              </>
            ),
      }}
        density="standard"
        getRowHeight={() => 'auto'}
        sx={{
          '& .MuiDataGrid-cell': {
            padding: '8px',
          },
        }}
      />

         {/* SHOW TREND */}
         <Dialog 
        open={openChart} 
        onClose={() => setOpenChart(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            {data.length > 0 ? (
              <NDTVStyleChart data={data} />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </div>


  );
};

export default Client; 