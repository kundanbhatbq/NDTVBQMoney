import React, { useEffect, useRef, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    Tooltip
} from "@mui/material";
import Chart from 'react-apexcharts';
import html2canvas from "html2canvas";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from 'react-router-dom';
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";

const CustomDialog = ({ setOpen, open, categories, seriesData, minimum, maximum, source }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [headerVisible, setHeaderVisible] = useState(true);
    const [subHeaderVisible, setSubHeaderVisible] = useState(true);
    const [header, setHeader] = useState("");
    const [subHeader, setSubHeader] = useState("");
    const chartRef = useRef(null);

    

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const downloadChart = () => {
        const yearlyButtons = document.querySelectorAll(".yearly-btn");
        yearlyButtons.forEach((button) => {
            button.style.display = "none";
        });
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

    const formattedTime = currentTime.getHours() + ':' + (currentTime.getMinutes() < 10 ? '0' : '') + currentTime.getMinutes();

    return (
        <div>
            <Dialog fullWidth maxWidth="lg" open={open} onClose={() => setOpen(false)}>
                <DialogTitle variant="h5" style={{ fontWeight: 'bold' }}>Top Gainers & Losers</DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={() => setOpen(false)}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <DialogContent dividers>
                    <div style={{ position: 'relative', width: '100%', paddingTop: '45.25%' }}>
                        <div style={{ position: 'absolute', top: 0, left: 2, right: 2, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div id="chart-container" ref={chartRef} style={{ padding: "5px", display: "flex", flexDirection: "column", width: '80%', maxWidth: '600px' }}>
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
                                <Chart
                                    options={{
                                        chart: {
                                            id: 'dummy-bar-chart',
                                            toolbar: {
                                                show: false,
                                            },
                                            type: 'horizontalBar',
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
                                            formatter: function (value) {
                                                return value?.toFixed(2) + ' %';
                                            },
                                            offsetX: -50,
                                        },
                                        xaxis: {
                                            categories: categories,
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
                                            min: minimum,
                                            max: maximum
                                        },
                                        yaxis: {
                                            labels: {
                                                formatter: function (val) {
                                                    if (typeof val === 'number' && !isNaN(val)) {
                                                        return val.toFixed(2) + '%';
                                                    }
                                                    return val;
                                                }
                                            }
                                        },
                                    }}
                                    series={[{
                                        name: 'Percentage Change',
                                        data: seriesData,
                                    }]}
                                    type="bar"
                                    width="100%"
                                    height={400}
                                />
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
                                            {`Source : ${source?.[0] === 1 ? "NSE" : "BSE"}`}
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
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CustomDialog
