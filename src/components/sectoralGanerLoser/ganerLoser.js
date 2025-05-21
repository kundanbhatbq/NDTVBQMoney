import React, { useEffect, useRef, useState } from 'react';
import { AppBar, Box, Grid, Tooltip, Typography, TextField } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { Link } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import html2canvas from "html2canvas";
import ApexCharts from 'react-apexcharts';
import "./ganerLoser.scss"

const GanerLoser = () => {
    const chartRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const options = [
        { label: 'Option 1', value: 1 },
        { label: 'Option 2', value: 2 },
        { label: 'Option 3', value: 3 },
    ];

    const gainerLoserData = [
        { label: 'Gainer A', value: 120 },
        { label: 'Gainer B', value: 110 },
        { label: 'Gainer C', value: 100 },
        { label: 'Gainer D', value: 90 },
        { label: 'Gainer E', value: 80 },
        { label: 'Gainer F', value: 75 },
        { label: 'Gainer G', value: 70 },
        { label: 'Gainer H', value: 65 },
        { label: 'Gainer I', value: 60 },
        { label: 'Gainer A', value: 55 },
        { label: 'Gainer B', value: 50 },
        { label: 'Gainer C', value: 45 },
        { label: 'Gainer D', value: 40 },
        { label: 'Gainer E', value: 35 },
        { label: 'Gainer F', value: 30 },
        { label: 'Gainer G', value: 25 },
        { label: 'Gainer H', value: 20 },
        { label: 'Gainer I', value: 15 },
        { label: 'Gainer H', value: 10 },
        { label: 'Gainer I', value: 5 },
    ];

    const labels = gainerLoserData.map(entry => entry.label);
    const series = gainerLoserData.map(entry => entry.value);

    const barChartData = {
        series: [{
            data: series
        }],
        options: {
            chart: {
                type: 'bar',
                height: 350,
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    dataLabels: {
                        position: 'center',
                    },
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return Math.abs(val) + '%';
                },
                style: {
                    colors: ['#fff']
                }
            },
            xaxis: {
                categories: labels,
            },
            title: {
                text: "NSE",
                align: 'center',
                style: {
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#333',
                }
            },
            colors: series.map(val => val < 0 ? '#FF0000' : '#008000')
        },
    };

    const downloadChart = () => {
        html2canvas(chartRef.current, {
            scale: 2,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const aspectRatio = 13 / 9;
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
                                        <span>Gainers/Losers</span>
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

            <Grid className="auto-container">
                <Autocomplete
                    size='small'
                    options={options}
                    renderInput={(params) => <TextField {...params} label="Options" />}
                />
            </Grid>

            <div style={{ position: 'relative', width: '100%', paddingTop: '46.25%' }}>
                <div style={{ position: 'absolute', top: 0, left: 2, right: 2, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div id="chart-container" ref={chartRef} style={{ padding: "5px", display: "flex", flexDirection: "column", width: '80%', maxWidth: '600px' }}>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <ApexCharts
                                options={barChartData.options}
                                series={barChartData.series}
                                type="bar"
                                height={500}
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
        </div>
    );
};

export default GanerLoser;
