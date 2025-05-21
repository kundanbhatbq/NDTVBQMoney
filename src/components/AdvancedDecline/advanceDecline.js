import { AppBar, Box, Button, Grid, Tooltip, Typography } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react'
import HomeIcon from "@mui/icons-material/Home";
import { Link, useNavigate } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import html2canvas from "html2canvas";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import Cookies from 'js-cookie';
import { apiConfig } from '../../commonApi/apiConfig';

const AdvanceDecline = () => {
    const [token, setToken] = useState(() => Cookies.get("token") || "");
    const [exchange, setExchange] = useState("NSE");
    const [currentTime, setCurrentTime] = useState(new Date());
    const chartRef = useRef(null);
    const [pieData, setpieData] = useState({});
    const navigate = useNavigate();
    console.log("pietData",pieData.advance,pieData.decline )

// Utility to calculate GCD
function calculateGCD(a, b) {
    return b === 0 ? a : calculateGCD(b, a % b);
  }
  
  function formatRatio(advance, decline) {
    if (advance === 0 && decline === 0) return "0:0"; // Both are zero
    if (advance === 0) return "0:1"; // No advances
    if (decline === 0) return "1:0"; // No declines
  
    if (advance >= decline) {
      const scaled = (advance / decline).toFixed(0); 
      return `${scaled}:1`;
    } else {
      const scaled =(decline / advance).toFixed(0); 
      return `1:${scaled}`;
    }
  }
  

  
    useEffect(() => {
        const fetchData = async () => {
            const tokenFromCookies = Cookies.get("token");
            if (tokenFromCookies) {
                setToken(tokenFromCookies);
                getAdvanceDecline();
            } else {
                navigate("/");
            }
        };
        fetchData();
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, [exchange]);



    const getAdvanceDecline = async () => {
        try {
            const response = await apiConfig(`getAdvDec?exchangeId=${exchange === "NSE" ? 1 : 2}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
            setpieData(response)
          

        } catch (error) {
            if (error?.code === "ERR_NETWORK" || token === "") {
                Cookies.remove("token");
                Cookies.remove("email");
                navigate("/");
            }
            console.error(error);
        }

    }

    const downloadChart = () => {
        html2canvas(chartRef.current, {
            scale: 2,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const aspectRatio = 15 / 9;
            const width = canvas.width;
            const height = Math.round(width / aspectRatio);
            const croppedCanvas = document.createElement('canvas');
            const ctx = croppedCanvas.getContext('2d');
            croppedCanvas.width = width;
            croppedCanvas.height = height;
            ctx.drawImage(canvas, 0, 0, width, height);
            const dataUrl = croppedCanvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'chart.png';
            link.click();
        });
    };


    function getTooltipData(opts) {
        if (opts && opts.w && opts.w.globals) {
            const tooltipData = opts.w.globals.initialSeries[opts.seriesIndex];
            return tooltipData !== undefined ? tooltipData.toString() : '';
        }
        return '';
    }

    const formattedTime = currentTime.getHours() + ':' + (currentTime.getMinutes() < 10 ? '0' : '') + currentTime.getMinutes();

    return (
        <div>
            <header>
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
                                <Typography variant="h5" className="announcements-title">
                                    <strong>
                                        <span>Advanced Decline</span>
                                    </strong>
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
                </Box>
            </header>

            <Grid container style={{ margin: '60px 10px' }}>
                <Grid item xs={1}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Button
                            variant={exchange === 'NSE' ? 'contained' : 'outlined'}
                            onClick={() => setExchange('NSE')}
                            color="primary"
                            size="small"
                            style={{ minWidth: "100px" }}
                            sx={{ marginBottom: '10px' }}
                        >
                            NSE
                        </Button>
                        <Button
                            variant={exchange === 'BSE' ? 'contained' : 'outlined'}
                            onClick={() => setExchange('BSE')}
                            color="primary"
                            size="small"
                            style={{ minWidth: "100px" }}
                            sx={{ marginBottom: '10px' }}
                        >
                            BSE
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <div style={{ position: 'relative', width: '100%', paddingTop: '16.25%' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div id="chart-container" ref={chartRef} style={{ padding: "2px", display: "flex", flexDirection: "column", width: '100%', maxWidth: '700px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            {pieData && Object.keys(pieData).length > 0 && (
                                <ReactApexChart
                                    options={{
                                        chart: {
                                            type: 'pie',
                                        },
                                        title: {
                                            text: pieData.exchange,
                                            align: 'center',
                                            style: {
                                                fontSize: '30px',
                                                fontWeight: 'bold',
                                                color: '#333',
                                            }
                                        },
                                        dataLabels: {
                                            formatter: function (val, opts) {
                                                const tooltipData = getTooltipData(opts);
                                                return tooltipData !== undefined ? tooltipData.toString() : '';
                                            }
                                        },
                                        labels: ['Advance', 'Decline', 'Unchanged', `Total: ${pieData.total}`],
                                        colors: ['#4CAF50', '#FF0000', '#808080'],
                                        
                                    }}
                                    series={[pieData.advance, pieData.decline, parseInt(pieData.unchanged)]}
                                    type="pie"
                                    height={400}
                                    width={500}
                                />
                            )}
                        </div>

   {/* Ratio Typography */}
   <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              {pieData && Object.keys(pieData).length > 0 && (
                <Typography variant="h4" fontWeight="bold">
                   Advance:Decline ={" "}
                  {formatRatio(pieData.advance, pieData.decline)}
                </Typography>
              )}
            </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                                <Typography variant="body2" fontWeight={'bold'}>
                                    Date: {currentTime.toLocaleDateString()}
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="body2" fontWeight={'bold'}>
                                    Time: {formattedTime}
                                </Typography>
                            </div>
                        </div>

                        <div className="source">
                            <Tooltip title="Go to Home">
                                <Link to="/interested">
                                    <img
                                        src={"../../../images/logo.png"}
                                        alt="NDTVPROFIT"
                                        className="NDTV-logo"
                                    />
                                </Link>
                            </Tooltip>
                        </div>

                        <button onClick={downloadChart} className="download-btn">
                            <DownloadSharpIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdvanceDecline;
