import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HomeIcon from "@mui/icons-material/Home";
import { AppBar, Box, Button, Grid, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import Cookies from 'js-cookie';
import html2canvas from "html2canvas";
import { apiConfig } from '../../commonApi/apiConfig';
import ReactApexChart from 'react-apexcharts';
import HeatMap from '../heatMap/heatMap';
import SectorHeatmap  from '../heatMap/SectorHeatmap'
import './sectorial.scss';

const Abbreviations = {
    "close7days": "7 Days",
    "closeThisWeek": "This Week",
    "closeThisMonth": "This Month",
    "close1Month": "1 Month",
    "close3Months": "3 Month",
    "close6Months": "6 Month",
    "close9Months": "9 Month",
    "closeThisYear": "This Year",
    "close1Year": "1 Year"
}

const Sectorial = () => {
    const [token, setToken] = useState(() => Cookies.get("token") || "");
    const [sectorial, setSectorial] = useState([]);
    const [originalSectorOrder, setOriginalSectorOrder] = useState([]);
    const [header, setHeader] = useState("");
    const [subHeader, setSubHeader] = useState("");
    const [headerVisible, setHeaderVisible] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [subHeaderVisible, setSubHeaderVisible] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('percentChange');
    const [xAxisLabels, setXAxisLabels] = useState([]);
    const [exchange, setExchange] = useState("SECTORAL");
    const chartRef = useRef(null);
    const navigate = useNavigate();
    console.log( 'sectorial', sectorial)

    useEffect(() => {
        const fetchData = async () => {
            const tokenFromCookies = Cookies.get("token");
            if (tokenFromCookies) {
                setToken(tokenFromCookies);
                getSectorial();
            } else {
                navigate("/");
            }
        };

        fetchData();
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const sortedLabels = originalSectorOrder.slice().sort((a, b) => {
            const dataA = sectorial.find(item => item.name === a);
            const dataB = sectorial.find(item => item.name === b);
            if (selectedPeriod === 'percentChange') {
                return parseFloat(dataA.percentChange) - parseFloat(dataB.percentChange);
            } else {
                return parseFloat(((dataA.lastPrice - dataA[selectedPeriod]) / dataA[selectedPeriod]) * 100) - parseFloat(((dataB.lastPrice - dataB[selectedPeriod]) / dataB[selectedPeriod]) * 100);
            }
        });
        setXAxisLabels(sortedLabels);
    }, [selectedPeriod, originalSectorOrder, sectorial]);

    const getSectorial = async () => {
        try {
            const response = await apiConfig(
                `getStocksData?exchangeSymbols=NIFTY OIL AND GAS,NIFTY IT,NIFTY ENERGY,NIFTY AUTO,NIFTY FMCG,NIFTY REALTY,NIFTY MEDIA,NIFTY BANK,NIFTY PHARMA,NIFTY FIN SERVICE,NIFTY PSU BANK,NIFTY METAL,NIFTY IND DEFENCE,NIFTY RURAL, NIFTY CONSUMPTION `,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setSectorial(response);
            setOriginalSectorOrder(response.map(item => item.name));

        } catch (error) {
            if (error?.code === "ERR_NETWORK" || token === "") {
                Cookies.remove("token");
                Cookies.remove("email");
                navigate("/");
            }
            console.error(error);
        }
    }

    const sortSectorialData = (data, sortBy) => (
        data.slice().sort((a, b) => {
            if (sortBy === 'percentChange') {
                return parseFloat(a.percentChange) - parseFloat(b.percentChange);
            } else {
                return parseFloat(((a.lastPrice - a[sortBy]) / a[sortBy]) * 100) - parseFloat(((b.lastPrice - b[sortBy]) / b[sortBy]) * 100);
            }
        }).map(item => {
            if (sortBy === 'percentChange') {
                return parseFloat(item.percentChange);
            } else {
                return parseFloat(((item.lastPrice - item[sortBy]) / item[sortBy]) * 100)?.toFixed(2);
            }
        })
    );

    const chartOptions = {
        chart: {
            type: 'bar',
            height: '100%',
            width: '100%',
            toolbar: { show: false },
        },
        dataLabels: {
            textAnchor: "middle",
            distributed: false,
            style: {
                colors: [
                    function (opts) {
                        if (opts.w.config.series[0].data[opts.dataPointIndex] < 0) {
                            return "#606565";
                        } else {
                            return "#000000";
                        }
                    },
                ],
                fontSize: '10px'
            },
            offsetY: -18,
        },
        plotOptions: {
            bar: {
                columnWidth: '75%',
                horizontal: false,
                dataLabels: {
                    position: "bottom"
                },
                colors: {
                    ranges: [
                        {
                            from: -Infinity,
                            to: 0,
                            color: '#f4232b'
                        },
                        {
                            from: 0,
                            to: Infinity,
                            color: '#43c222'
                        }
                    ]
                },
            }
        },
        tooltip: {
            enabled: false
        },
        xaxis: {
            categories: xAxisLabels,
            labels: {
                style: {
                    fontWeight: 'bold'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    fontWeight: 'bold',
                    fontSize: '12px'
                }
            }
        },
    };

    const series = [{
        name: 'Points Percent Change',
        data: selectedPeriod === "percentChange" ? sortSectorialData(sectorial, 'percentChange') : sortSectorialData(sectorial, selectedPeriod),
    }];

    // const downloadChart = () => {
    //     const yearlyButtons = document.querySelectorAll(".yearly-btn");
    //     yearlyButtons.forEach((button) => {
    //         button.style.display = "none";
    //     });
    //     html2canvas(chartRef.current, {
    //         scale: 2,
    //         backgroundColor: '#ffffff'
    //     }).then(canvas => {
    //         const aspectRatio = 13 / 9;
    //         const width = canvas.width;
    //         const height = Math.round(width / aspectRatio);
    //         const croppedCanvas = document.createElement('canvas');
    //         const ctx = croppedCanvas.getContext('2d');
    //         croppedCanvas.width = width;
    //         croppedCanvas.height = height;
    //         ctx.drawImage(canvas, 0, 0, width, height);
    //         const dataUrl = croppedCanvas.toDataURL('image/png');

    //         const link = document.createElement('a');
    //         link.href = dataUrl;
    //         link.download = 'chart.png';
    //         link.click();
    //     });
    // };

    const downloadChart = () => {
        const yearlyButtons = document.querySelectorAll(".yearly-btn");
        yearlyButtons.forEach((button) => {
            button.style.display = "none";
        });
        if (chartRef.current) {
            const container = chartRef.current;
            const width = container.offsetWidth;
            const height = width * (16 / 16);

            html2canvas(container, { width, height }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'chart.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
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

    const handlePeriodChange = (event) => {
        setSelectedPeriod(event.target.value);
    };

    const formattedTime = currentTime.getHours() + ':' + (currentTime.getMinutes() < 10 ? '0' : '') + currentTime.getMinutes();

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f0f8ff" }} >
          
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
                                <Typography variant="h5">
                                    <strong>Sectoral</strong>
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

            <Grid container style={{ margin: '60px 10px 10px' }}>
                <Grid item xs={1}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Button
                            variant={exchange === 'SECTORAL' ? 'contained' : 'outlined'}
                            onClick={() => setExchange('SECTORAL')}
                            color="primary"
                            size="small"
                            style={{ minWidth: "100px" }}
                            sx={{ marginBottom: '5px' }}
                        >
                            SECTORAL
                        </Button>
                        <Button
                            variant={exchange === 'HEATMAP' ? 'contained' : 'outlined'}
                            onClick={() => setExchange('HEATMAP')}
                            color="primary"
                            size="small"
                            style={{ minWidth: "100px" }}
                            sx={{ marginBottom: '5px' }}
                        >
                            HEATMAP
                        </Button>

                        <Button
                            variant={exchange === 'CONTRIBUTION' ? 'contained' : 'outlined'}
                            onClick={() => setExchange('CONTRIBUTION')}
                            color="primary"
                            size="small"
                            style={{ minWidth: "250px"}}
                        >
                            SECTOR CONTRIBUTION (NIFTY 50)
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            {
               <div>
               {exchange === "SECTORAL" && (
                   <div style={{ position: 'relative', width: '100%', paddingTop: '30.25%' }}>
                       <div style={{ position: 'absolute', top: 0, left: 2, right: 2, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                           <div id="chart-container" ref={chartRef} style={{ padding: "5px", display: "flex", flexDirection: "column", width: '100%', maxWidth: '600px' }}>
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
                               <div style={{ textAlign: "left", paddingBottom: "20px" }}>
                                   <Select
                                       value={selectedPeriod}
                                       onChange={handlePeriodChange}
                                       displayEmpty
                                       variant="outlined"
                                       size="small"
                                       style={{ minWidth: "100px" }}
                                       className="yearly-btn"
                                   >
                                       <MenuItem value="percentChange">
                                           Current
                                       </MenuItem>
                                       {Object.keys(Abbreviations).map((key) => (
                                           <MenuItem key={key} value={key}>
                                               {Abbreviations[key]}
                                           </MenuItem>
                                       ))}
                                   </Select>
                               </div>
                               <div style={{ display: 'flex', justifyContent: 'center' }}>
                                   <ReactApexChart
                                       options={chartOptions}
                                       series={series}
                                       type="bar"
                                       height={400}
                                       width={500}
                                   />
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
                               <div style={{ display: "flex", justifyContent: "space-between" }}>
                                   <div>
                                       <Typography variant="h6" fontWeight={'bold'}>
                                           Source : NSE
                                       </Typography>
                                   </div>
                                   <div>
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
                               </div>
                               <button onClick={downloadChart} className="download-btn">
                                   <DownloadSharpIcon />
                               </button>
                           </div>
                       </div>
                   </div>
               )}
               {exchange === "CONTRIBUTION" && (
                   <div>
                     <SectorHeatmap/>
                   </div>
               )}
               {exchange === "HEATMAP" && (
                   <div>
                       <HeatMap />
                   </div>
               )}
           </div>
    
            }

        </div >
    )
}

export default Sectorial;

