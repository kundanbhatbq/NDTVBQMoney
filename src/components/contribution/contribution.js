import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Box, Grid, TextField, Tooltip, Typography } from '@mui/material';
import HomeIcon from "@mui/icons-material/Home";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import ReactApexChart from 'react-apexcharts';
import "./contribution.scss"
import html2canvas from "html2canvas";
import { listData } from './data';
import { graphConfig } from '../../commonApi/apiConfig';
import Cookies from 'js-cookie';
import HeatMap from './Heatmap';

const Contribution = () => {
    const [active, setActive] = useState(0);
    const chartRef = useRef(null);
    const [token, setToken] = useState(() => Cookies.get("token") || "");
    const [barData, setBarData] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [header, setHeader] = useState("");
    const [subHeader, setSubHeader] = useState("");
    const [headerVisible, setHeaderVisible] = useState(true);
    const [subHeaderVisible, setSubHeaderVisible] = useState(true);
    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        let month = today.getMonth() + 1;
        let day = today.getDate();

        if (month < 10) {
            month = `0${month}`;
        }
        if (day < 10) {
            day = `0${day}`;
        }

        return `${year}-${month}-${day}`;
    });
    const navigate = useNavigate();



    useEffect(() => {
        const fetchData = async () => {
            const tokenFromCookies = Cookies.get("token");
            if (tokenFromCookies) {
                setToken(tokenFromCookies);
            } else {
                navigate("/");
            }
        };

        fetchData();
    }, [navigate]);

    useEffect(() => {
        const getDistribution = async () => {
            try {
                const exchangeSymbol = active === 0 ? 'NIFTY 50' : 'SENSEX';
                let url;
                if (startDate === getCurrentDate()) {
                    url = `getContribution?exchangeSymbol=${exchangeSymbol}`;
                } else {
                    url = `getContribution?startDate=${startDate}&exchangeSymbol=${exchangeSymbol}`;
                }

                const response = await graphConfig(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const filteredChartData = response.filter((item, index) => index !== 6 && index !== 13);
                setBarData(filteredChartData);
            } catch (error) {
                if (error?.code === "ERR_NETWORK" || token === "") {
                    Cookies.remove("token");
                    Cookies.remove("email");
                    navigate("/");
                }
                console.error(error);
            }
        };

        getDistribution();
    }, [active, startDate, token, navigate]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

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
                fontSize: '14px'
            },
            offsetX: -55,
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '95%',
                dataLabels: {
                    position: "bottom"
                },
                colors: {
                    ranges: [
                        {
                            from: -Infinity,
                            to: 0,
                            color: '#FF0000'
                        },
                        {
                            from: 0,
                            to: Infinity,
                            color: '#00FF00'
                        }
                    ]
                },
            }
        },
        tooltip: {
            enabled: false
        },
        xaxis: {
            categories: barData.map(item => item.ticker_name),
            labels: {
                style: {
                    fontWeight: 'bold'
                }
            },
            axisTicks: {
                show: false
            },
            tickPlacement: 'on',
            crosshairs: {
                width: 1
            },
            min: -Math.max(...barData.map(item => Math.abs(item.points_percent_change))),
            max: Math.max(...barData.map(item => Math.abs(item.points_percent_change)))
        },
        yaxis: {
            labels: {
                style: {
                    fontWeight: 'bold'
                }
            }
        },
        grid: {
            padding: {
                bottom: 50
            }
        },
        noData: {
            text: "No Data",
            align: "center",
            verticalAlign: "middle",
        }
    };

    const series = [{
        name: 'Points Percent Change',
        data: barData.map(item => parseFloat(item.points_percent_change))
    }];

    const downloadChart = () => {
        const yearlyButtons = document.querySelectorAll(".yearly-btn");
        yearlyButtons.forEach((button) => {
            button.style.display = "none";
        });
        html2canvas(chartRef.current, {
            scale: 2,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const aspectRatio = 3.5 / 2.1;
            const width = canvas.width
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

    const handleDateChange = (event) => {
        setStartDate(event.target.value);
    };
    

    const formattedTime = currentTime.getHours() + ':' + (currentTime.getMinutes() < 10 ? '0' : '') + currentTime.getMinutes();

    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        let month = today.getMonth() + 1;
        let day = today.getDate();

        // Pad month and day with zero if less than 10
        if (month < 10) {
            month = `0${month}`;
        }
        if (day < 10) {
            day = `0${day}`;
        }

        return `${year}-${month}-${day}`;
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f0f8ff" }}>
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
                                    <strong>Contribution</strong>
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

            <div style={{ padding: "60px 0px 0px 0px" }}>
                {listData?.map((item, index) => (
                    <button className={`button ${active === index ? "active" : ""}`} key={index} onClick={() => setActive(index)}>{item}</button>
                ))}
            </div>



            {active === 2 ? (
         <HeatMap/>
            ):( 
            <div style={{ position: 'relative', width: '100%', paddingTop: '36.25%' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div id="chart-container" ref={chartRef} style={{ padding: "0px 120px", display: "flex", flexDirection: "column", width: '100%', maxWidth: '720px' }}>
                        {/* <div>
                            <Typography variant="h5" style={{ fontWeight: 'bold' }}>Top Contribution To The {`${active === 0 ? 'Nifty 50' : 'Sensex'}`}</Typography>
                            <Typography variant="h6">(Point Contribution)</Typography>
                        </div> */}

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

                        <div className="flex-container">
                            <div>
                                <Typography>Name</Typography>
                            </div>
                            <div>
                                <Typography>Point Contribution to {`${active === 0 ? 'Nifty 50' : 'Sensex'}`} Change</Typography>
                            </div>
                        </div>

                        <div style={{ textAlign: "left", padding: "5px" }}>
                            <TextField
                                label="Start Date"
                                className="yearly-btn"
                                type="date"
                                value={startDate}
                                onChange={handleDateChange}
                                sx={{ marginLeft: '5px', width: "150px" }}
                                size="small"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                             <Typography variant='h6'>
                                {`${startDate === getCurrentDate() ? "Today" : `Since ${startDate}`}`}
                            </Typography>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%' }}>
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
            </div>)}
           



            
        </div>
    );
}

export default Contribution;
