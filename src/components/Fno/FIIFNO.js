import React, { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { apiConfig } from "../../commonApi/apiConfig";
import Cookies from "js-cookie";
import "./index.scss";
import { useNavigate } from "react-router";
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
import html2canvas from "html2canvas";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from '@mui/material/styles'; // Import styled

const FIIFNO = () => {
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  const navigate = useNavigate();
  const [data, setData] = useState([]);  // Initialize as empty array
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
      getFIIFNO();
    }
  }, [token]);  // Add token as dependency

  const getFIIFNO = async () => {
    const getFuturesEndpoint = `getDerivativesfii`;
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

  // Explicitly define each column
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
      field: 'Net Index Fut Contracts Buy/Sell',
      headerName: 'Net Index Fut Contracts',
      type: 'number',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Net Index Fut Buy/Sell - Rs Crore',
      headerName: 'Net Index Fut - Rs Crore',
      type: 'number',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Net Nifty Fut Contracts',
      headerName: 'Net Nifty Fut Contracts',
      type: 'number',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Net Nifty Fut (Buy/ Sell) - Rs Crore',
      headerName: 'Net Nifty Fut - Rs Crore',
      type: 'number',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Nifty Futures OI - Rs Crore',
      headerName: 'Nifty Futures OI - Rs Crore',
      type: 'number',
      width: 200,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Nifty Futures 30-day average OI',
      headerName: 'Nifty Futures 30d Avg OI',
      type: 'number',
      width: 200,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Net Stocks Fut Contracts',
      headerName: 'Net Stocks Fut Contracts',
      type: 'number',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Net Stocks Fut OI - Rs Crore',
      headerName: 'Net Stocks Fut OI - Rs Crore',
      type: 'number',
      width: 200,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Net Stock Futures 30-day average OI',
      headerName: 'Stock Futures 30d Avg OI',
      type: 'number',
      width: 200,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Net Nifty Bank Fut Contracts (Buy/ Sell)',
      headerName: 'Net Bank Fut Contracts',
      type: 'number',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Net Nifty Bank Fut - Rs Crore',
      headerName: 'Net Nifty Bank Fut - Rs Crore',
      type: 'number',
      width: 200,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Nifty Bank Fut OI',
      headerName: 'Nifty Bank Fut OI',
      type: 'number',
      width: 220,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'FII Cash - NSE Prov',
      headerName: 'FII Cash - NSE Prov',
      width: 180,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => params.value === null ? '-' : params.value,
    },
    {
      field: 'Nifty Net Options (Contract)',
      headerName: 'Nifty Net Options (Contracts)',
      type: 'number',
      width: 220,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Nifty Net Options BUY/ SELL',
      headerName: 'Nifty Net Options BUY/SELL',
      type: 'number',
      width: 220,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Net Index Option',
      headerName: 'Net Index Option',
      type: 'number',
      width: 220,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Net Index Option OI',
      headerName: 'Net Index Option OI',
      type: 'number',
      width: 220,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },

    {
      field: 'Net Index Future OI',
      headerName: 'Net Index Future OI',
      type: 'number',
      width: 220,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },
    {
      field: 'Nifty Net Option OI',
      headerName: 'Nifty Net Option OI',
      type: 'number',
      width: 220,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    },

    {
      field: 'Net Stock Futures',
      headerName: 'Net Stock Futures',
      type: 'number',
      width: 220,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => formatNumber(params.value),
      cellClassName: getCellClass,
    }
  ];



  // Nifty Futures OI - Rs Crore

  const NDTVStyleChart = ({ data }) => {
    const [hoverPoint, setHoverPoint] = useState(null);
    const [logoImage, setLogoImage] = useState(null);
    const [logoDataUrl, setLogoDataUrl] = useState(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    
    // Load saved title from localStorage or use default
    const [chartTitle, setChartTitle] = useState(() => {
        const savedTitle = localStorage.getItem('chartTitle');
        return savedTitle || "FII In Nifty Futures";
    });
    
    // Save title to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('chartTitle', chartTitle);
    }, [chartTitle]);
    
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
    
    // Extract both datasets for charting
    const chartData = sortedData.map(item => ({
      date: new Date(item.DATE),
      netValue: item["Net Nifty Fut (Buy/ Sell) - Rs Crore"],
      oiValue: item["Nifty Futures OI - Rs Crore"] // New data point
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

    // Find min and max for scaling - Net Values (right axis)
    const netValues = chartData.map(d => d.netValue);
    const minNetValue = Math.min(...netValues);
    const maxNetValue = Math.max(...netValues);
    const absMaxNet = Math.max(Math.abs(minNetValue), Math.abs(maxNetValue)) * 1.1; // Add 10% margin
    
    // Find min and max for scaling - OI Values (left axis)
    const oiValues = chartData.map(d => d.oiValue);
    const minOiValue = Math.min(...oiValues);
    const maxOiValue = Math.max(...oiValues);
    // Round to nearest 1000 as requested
    const absMaxOi = Math.ceil(Math.max(Math.abs(minOiValue), Math.abs(maxOiValue)) / 1000) * 1000;
    
    // Scale functions
    const xScale = (index) => {
      return padding.left + (index / (chartData.length - 1)) * (width - padding.left - padding.right);
    };
    
    // Right Y-Axis scale for Net Values
    const yScaleNet = (value) => {
      // Center the zero line
      const zeroY = padding.top + (height - padding.top - padding.bottom) / 2;
      return zeroY - (value / absMaxNet) * ((height - padding.top - padding.bottom) / 2);
    };
    
    // Left Y-Axis scale for OI Values - Now supporting negative values
    const yScaleOi = (value) => {
      // Full scale from bottom to top for OI values, with zero at center
      const zeroY = padding.top + (height - padding.top - padding.bottom) / 2;
      return zeroY - (value / absMaxOi) * ((height - padding.top - padding.bottom) / 2);
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
    
    // Create ticks for left Y-axis (OI values) - with both positive and negative values
    const oiTicks = [];
    
    // Add negative ticks
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue; // Skip zero as it's added separately
      const value = i * (absMaxOi / 4);
      oiTicks.push({
        y: yScaleOi(value),
        label: (value / 1000).toFixed(1) + 'K'
      });
    }
    
    // Add zero tick
    oiTicks.push({
      y: yScaleOi(0),
      label: '0'
    });
    
    // Sort ticks by y-position (top to bottom)
    oiTicks.sort((a, b) => a.y - b.y);
    
    // Create ticks for right Y-axis (Net values)
    const netTicks = [];
    
    // Add negative ticks
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue; // Skip zero as it's added separately
      const value = i * (absMaxNet / 4);
      netTicks.push({
        y: yScaleNet(value),
        label: (value / 1000).toFixed(1) + 'K'
      });
    }
    
    // Add zero tick
    netTicks.push({
      y: yScaleNet(0),
      label: '0'
    });
    
    // Sort ticks by y-position (top to bottom)
    netTicks.sort((a, b) => a.y - b.y);
    
    // Get current values for display
    const currentNetValue = chartData[chartData.length - 1].netValue.toFixed(2);
    const currentOiValue = chartData[chartData.length - 1].oiValue.toFixed(2);
    
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
          netValue: chartData[closestIndex].netValue,
          oiValue: chartData[closestIndex].oiValue,
          x: xScale(closestIndex),
          yNet: yScaleNet(chartData[closestIndex].netValue),
          yOi: yScaleOi(chartData[closestIndex].oiValue)
        });
      } else {
        setHoverPoint(null);
      }
    };
    
    // Handler for mouse leave
    const handleMouseLeave = () => {
      setHoverPoint(null);
    };
    
    // Handler for title click - enter edit mode
    const handleTitleClick = () => {
      setIsEditingTitle(true);
    };
    
    // Handler for title input change
    const handleTitleChange = (e) => {
      setChartTitle(e.target.value);
    };
    
    // Handler for title input blur or enter key - exit edit mode
    const handleTitleBlur = () => {
      setIsEditingTitle(false);
    };
    
    const handleTitleKeyDown = (e) => {
      if (e.key === 'Enter') {
        setIsEditingTitle(false);
      }
    };
    
    // Create paths for Net Value segments, colored by trend
    const generateNetValuePaths = () => {
      if (chartData.length < 2) return [];
    
      const segments = [];
    
      for (let i = 0; i < chartData.length - 1; i++) {
        const startX = xScale(i);
        const startY = yScaleNet(chartData[i].netValue);
        const endX = xScale(i + 1);
        const endY = yScaleNet(chartData[i + 1].netValue);
    
        // Determine color based on transition between values
        let color;
        if (chartData[i].netValue >= 0 && chartData[i + 1].netValue >= 0) {
          color = "#2E7D32"; // Green for continuous positive values
        } else if (chartData[i].netValue < 0 && chartData[i + 1].netValue < 0) {
          color = "#C62828"; // Red for continuous negative values
        } else if (chartData[i].netValue >= 0 && chartData[i + 1].netValue < 0) {
          color = "#C62828"; // Turning red when transitioning from positive to negative
        } else {
          color = "#2E7D32"; // Turning green when transitioning from negative to positive
        }
    
        segments.push({
          path: `M ${startX} ${startY} L ${endX} ${endY}`,
          color
        });
      }
    
      return segments;
    };
    
    // Create path for OI Value, solid black line
    const generateOiValuePath = () => {
      if (chartData.length < 2) return '';
      
      let path = `M ${xScale(0)} ${yScaleOi(chartData[0].oiValue)}`;
      
      for (let i = 1; i < chartData.length; i++) {
        path += ` L ${xScale(i)} ${yScaleOi(chartData[i].oiValue)}`;
      }
      
      return path;
    };
    
    const netPathSegments = generateNetValuePaths();
    const oiPath = generateOiValuePath();
    
    return (
        <div style={{ textAlign: "center" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleDownload} 
                    sx={{ marginTop: '20px' }}
                >
                    Download
                </Button>
                
                <div style={{ marginTop: '20px' }}>
                    {isEditingTitle ? (
                        <input 
                            type="text" 
                            value={chartTitle}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                            autoFocus
                            style={{
                                fontSize: '16px',
                                padding: '5px',
                                width: '250px',
                                textAlign: 'center',
                                fontWeight: 'bold'
                            }}
                        />
                    ) : (
                        <div 
                            onClick={handleTitleClick}
                            style={{
                                cursor: 'pointer',
                                padding: '5px',
                                border: '1px dashed transparent',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                fontSize: '16px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.border = '1px dashed #ccc'}
                            onMouseOut={(e) => e.currentTarget.style.border = '1px dashed transparent'}
                        >
                            {chartTitle} (click to edit)
                        </div>
                    )}
                </div>
                
                <div style={{ width: '100px', marginTop: '20px' }}></div> {/* Empty div for spacing */}
            </div>
       
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
                        {chartTitle}
                    </text>
                    
                    {/* Zero line */}
                    <line 
                      x1={padding.left} 
                      x2={width - padding.right} 
                      y1={yScaleNet(0)} 
                      y2={yScaleNet(0)} 
                      stroke="#ccc" 
                      strokeWidth="1"
                      strokeDasharray="5,5"
                    />
                    
                    {/* Left Y-axis (OI Values) */}
                    <line 
                      x1={padding.left} 
                      y1={padding.top} 
                      x2={padding.left} 
                      y2={height - padding.bottom} 
                      stroke="#666" 
                      strokeWidth="1"
                    />
                    
                    {/* Right Y-axis (NET Values) */}
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
                      style={{ fontSize: '14px', fill: '#000', fontWeight: 'bold' }}
                    >
                      FII Net Nifty Futures OI (Rs Crore)
                    </text>
                    
                    {/* Left Y-axis ticks */}
                    {oiTicks.map((tick, i) => (
                      <g key={`oi-tick-${i}`}>
                        <line 
                          x1={padding.left - 5} 
                          y1={tick.y} 
                          x2={padding.left} 
                          y2={tick.y} 
                          stroke="#666" 
                          strokeWidth="1"
                        />
                        <text 
                          x={padding.left - 10} 
                          y={tick.y} 
                          textAnchor="end" 
                          alignmentBaseline="middle"
                          style={{ fontSize: '12px', fill: '#666' }}
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
                      style={{ fontSize: '14px', fill: 'green', fontWeight: 'bold' }}
                    >
                      FII Net Nifty Fut (Long/Short) (Rs Crore)
                    </text>
                    
                    {/* Right Y-axis ticks */}
                    {netTicks.map((tick, i) => (
                      <g key={`net-tick-${i}`}>
                        <line 
                          x1={width - padding.right} 
                          y1={tick.y} 
                          x2={width - padding.right + 5} 
                          y2={tick.y} 
                          stroke="green" 
                          strokeWidth="1"
                        />
                        <text 
                          x={width - padding.right + 10} 
                          y={tick.y} 
                          textAnchor="start" 
                          alignmentBaseline="middle"
                          style={{ fontSize: '12px', fill: 'green' }}
                        >
                          {tick.label}
                        </text>
                      </g>
                    ))}
                    
                    {/* Render Net Value colored line segments */}
                    {netPathSegments.map((segment, index) => (
                      <path 
                        key={`net-segment-${index}`}
                        d={segment.path} 
                        fill="none" 
                        stroke={segment.color} 
                        strokeWidth="1.5"
                      />
                    ))}
                    
                    {/* Render OI Value black line */}
                    <path 
                      d={oiPath} 
                      fill="none" 
                      stroke="#000" 
                      strokeWidth="1.5"
                    />
                    
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
                        y={height - padding.bottom + 20 } 
                        textAnchor="middle" 
                        style={{ fontSize: '14px', fill: '#666' }}
                      >
                        {tick.label}
                      </text>
                    ))}
                    
                    {/* Legend */}
                    <g transform={`translate(${width - padding.right - 170}, 20)`}>
                      {/* OI Value legend */}
                      <line x1="0" y1="0" x2="20" y2="0" stroke="#000" strokeWidth="1.5" />
                      <text x="25" y="5" style={{ fontSize: '14px', fill: '#000' }}>
                        Futures OI
                      </text>
                      
                      {/* Net Buy/Sell legend */}
                      <line x1="0" y1="20" x2="20" y2="20" stroke="#2E7D32" strokeWidth="1.5" />
                      <text x="25" y="25" style={{ fontSize: '14px', fill: '#2E7D32' }}>
                        Net Long (Positive)
                      </text>
                      
                      <line x1="0" y1="40" x2="20" y2="40" stroke="#C62828" strokeWidth="1.5" />
                      <text x="25" y="45" style={{ fontSize: '14px', fill: '#C62828' }}>
                        Net Short (Negative)
                      </text>
                    </g>
                    
                    {/* Current values display */}
                    {/* OI Value (left) */}
                    <text 
                      x={padding.left } 
                      y={padding.top - 23}
                      textAnchor="start" 
                      style={{ fontSize: '13px', fontWeight: 'bold', fill: '#000' }}
                    >
                      FII Net Nifty Futures OI : {currentOiValue ? Number(currentOiValue).toLocaleString('en-IN') : '0'} ₹ Cr : ({chartData.length > 0 ? chartData[chartData.length - 1].date.toLocaleDateString('en-IN') : 'N/A'})
                    </text> 

                    {/* Net Value (right) */}
                    <text 
                      x={padding.left + 311}   
                      y={padding.top - 39}
                      textAnchor="end" 
                      style={{ fontSize: '13px', fontWeight: 'bold', fill: currentNetValue >= 0 ? "#2E7D32" : "#C62828" }}
                    >
                      FII Net Nifty Fut (Long/Short) : {Number(currentNetValue).toLocaleString('en-IN')} ₹ Cr : ({chartData.length > 0 ? chartData[chartData.length - 1].date.toLocaleDateString('en-IN') : 'N/A'})
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
                        <circle 
                          cx={hoverPoint.x}
                          cy={hoverPoint.yNet}
                          r={5}
                          fill={hoverPoint.netValue >= 0 ? "#2E7D32" : "#C62828"}
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        
                        <circle 
                          cx={hoverPoint.x}
                          cy={hoverPoint.yOi}
                          r={5}
                          fill="#000"
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        
                        {/* Tooltip background */}
                        <rect 
                          x={hoverPoint.x - 110}
                          y={Math.min(height - padding.bottom - 100, Math.max(padding.top, (hoverPoint.yNet + hoverPoint.yOi)/2 - 45))}
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
                          y={Math.min(height - padding.bottom - 100, Math.max(padding.top, (hoverPoint.yNet + hoverPoint.yOi)/2 - 45)) + 20}
                          textAnchor="middle"
                          style={{ fontSize: '14px', fontWeight: 'bold' }}
                        >
                          {formatDateFull(hoverPoint.date)}
                        </text>
                        
                        {/* Tooltip text - OI Value */}
                        <text 
                          x={hoverPoint.x}
                          y={Math.min(height - padding.bottom - 100, Math.max(padding.top, (hoverPoint.yNet + hoverPoint.yOi)/2 - 45)) + 45}
                          textAnchor="middle"
                          style={{ fontSize: '14px', fontWeight: 'bold', fill: '#000' }}
                        >
                          Futures OI: {hoverPoint.oiValue.toFixed(2).toLocaleString('en-IN')} ₹ Cr.
                        </text>
                        
                        {/* Tooltip text - Net Value */}
                        <text 
                          x={hoverPoint.x}
                          y={Math.min(height - padding.bottom - 100, Math.max(padding.top, (hoverPoint.yNet + hoverPoint.yOi)/2 - 45)) + 70}
                          textAnchor="middle"
                          style={{ 
                            fontSize: '14px', 
                            fontWeight: 'bold', 
                            fill: hoverPoint.netValue >= 0 ? "#2E7D32" : "#C62828" 
                          }}
                        >
                          Net Long/Short: {hoverPoint.netValue >= 0 ? "+" : ""}
                          {hoverPoint.netValue.toFixed(2).toLocaleString('en-IN')} ₹ Cr.
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
        
        componentsProps={{
          toolbar: {
            sx: {
              '& .MuiButton-root': {
                minWidth: '36px',
                padding: '6px',
                margin: '0 4px',
                '&:hover': {
                  backgroundColor: '#C5CAE9',
                },
                
              },
            },
          },
        }}
         
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

export default FIIFNO;