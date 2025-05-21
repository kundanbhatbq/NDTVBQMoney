import {
    AppBar,
    Badge,
    Box,
    Button,
    InputBase,
    Paper,
    IconButton,
    Grid,
    Tooltip,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { apiConfig, apiConfigNewsFlash } from '../../commonApi/apiConfig';
import { keyType } from './data';

const containerStyle = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f0f8ff",
};

const contentStyle = {
    padding: "60px 20px 0px 20px",
};

function openInNewTab(url) {
    const newTab = window.open(url, "_blank");
    if (newTab) {
        newTab.focus();
    }
}

export const AlertsNews = ({ token, navigate }) => {
    const [prevAlertCount, setPrevAlertCount] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(getAlertsCount, 10000);
        return () => clearInterval(intervalId);
    }, [prevAlertCount]);

    const getAlertsCount = async () => {
        const allAlerts = 'flash/getMarketAlertCount';
        try {
            const response = await apiConfigNewsFlash(allAlerts, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const currentAlertCount = response?.alertCount;
            const newCount = currentAlertCount - prevAlertCount;

            if (newCount !== 0) {
                setPrevAlertCount(currentAlertCount);
                setCount(newCount);
            }
        } catch (error) {
            if (token === '') {
                Cookies.remove('token');
                Cookies.remove('email');
                navigate('/');
            }
            console.error(error);
        }
    };

    return (
        <Badge badgeContent={`${count}`} color={'error'} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Button
                variant="contained"
                size="small"
                style={{
                    backgroundColor: 'red',
                    color: 'white',
                    fontWeight: 'bold',
                    marginTop: '2px',
                    

                
                }}
                onClick={(event) => {
                    event.stopPropagation();
                    openInNewTab('alerts');
                }}
            >
                Break Out Alerts
            </Button>
        </Badge>
    );
};

const Alerts = () => {
    const { id } = useParams();
    const [token, setToken] = useState(() => Cookies.get("token") || "");
    const [email, setEmail] = useState(() => Cookies.get("email") || "");
    const [alert, setAlert] = useState([])
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedKeyType, setSelectedKeyType] = useState("");
    const [secondSelectOptions, setSecondSelectOptions] = useState([]);
    const [secondSelectValue, setSecondSelectValue] = useState("");
    const [autoFetchAlerts, setAutoFetchAlerts] = useState(true);
    const navigate = useNavigate();
    let sanitizedValue = id?.replace(/&/g, "%26");


    useEffect(() => {
        const fetchData = async () => {
            const tokenFromCookies = Cookies.get("token");
            const emailFromCookies = Cookies.get("email");
            if (tokenFromCookies && emailFromCookies) {
                setToken(tokenFromCookies);
                setEmail(emailFromCookies);
                if (searchQuery?.length === 0 && autoFetchAlerts) {
                    await getAlerts();
                } else if (searchQuery?.length === 0 && token && !autoFetchAlerts) {
                    await getStockMarketAlert(secondSelectValue);
                }
            } else {
                navigate("/");
            }
        };

        fetchData();

        const intervalId = setInterval(async () => {
            if (searchQuery?.length === 0 && token) {
                if (autoFetchAlerts) {
                    await getAlerts();
                } else {
                    await getFilterMarketAlert(secondSelectValue);
                }
            }
        }, 10000);
        return () => clearInterval(intervalId);
    }, [searchQuery, autoFetchAlerts, secondSelectValue, token]);

    useEffect(() => {
        const fetchData = async () => {
            if (searchQuery?.length >= 3) {
                (!sanitizedValue && autoFetchAlerts) && (await getSearchAlerts());
                (sanitizedValue && autoFetchAlerts) && (await getStockAlerts());
                ((sanitizedValue || !sanitizedValue) && !autoFetchAlerts) && (await getStockMarketAlert());
            }
        };
        fetchData();
    }, [searchQuery]);

    useEffect(() => {
        getMarketEvent(selectedKeyType);
    }, [selectedKeyType]);

    const getAlerts = async () => {
        const isSymbol = `flash/getMarketAlert?exchangeSymbol=${sanitizedValue}`;
        const allAlerts = `flash/getMarketAlert`;
        try {
            const response = await apiConfigNewsFlash(
                `${sanitizedValue ? isSymbol : allAlerts}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setAlert(response);
        } catch (error) {
            if (token === "") {
                Cookies.remove("token");
                Cookies.remove("email");
                navigate("/");
            }
            setAlert([]);
            console.error(error);
        }
    };

    const getSearchAlerts = async () => {
        const allNews = `flash/getMarketAlert?text=${searchQuery}`;
        try {
            const response = await apiConfigNewsFlash(`${allNews}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAlert(response);
        } catch (error) {
            if (token === "") {
                Cookies.remove("token");
                Cookies.remove("email");
                navigate("/");
            }
            setAlert([]);
            console.error(error);
        }
    };

    const getStockAlerts = async () => {
        const isSymbol = `flash/getMarketAlert?exchangeSymbol=${sanitizedValue}&text=${searchQuery}`;
        try {
            const response = await apiConfigNewsFlash(`${isSymbol}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAlert(response);
        } catch (error) {
            if (token === "") {
                Cookies.remove("token");
                Cookies.remove("email");
                navigate("/");
            }
            setAlert([]);
            console.error(error);
        }
    };

    const getStockMarketAlert = async () => {
        const isSymbol = `flash/filterMarketAlert?value=${secondSelectValue}&type=${selectedKeyType}&searchText=${searchQuery}`;
        try {
            const response = await apiConfigNewsFlash(`${isSymbol}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAlert(response);
        } catch (error) {
            if (token === "") {
                Cookies.remove("token");
                Cookies.remove("email");
                navigate("/");
            }
            setAlert([]);
            console.error(error);
        }
    };

    const getAllAlerts = async (flag) => {

        const isSymbol = `flash/getMarketAlert?AllFlag=${flag}`;
        try {
            const response = await apiConfigNewsFlash(`${isSymbol}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAlert(response);
        } catch (error) {
            if (token === "") {
                Cookies.remove("token");
                Cookies.remove("email");
                navigate("/");
            }
            setAlert([]);
            console.error(error);
        }
    };

    const getFilterMarketAlert = async (value) => {
        const filterAlert = `flash/filterMarketAlert?value=${value}&type=${selectedKeyType}`;
        try {
            const response = await apiConfigNewsFlash(`${filterAlert}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAlert(response);
        } catch (error) {
            if (token === "") {
                Cookies.remove("token");
                Cookies.remove("email");
                navigate("/");
            }
            setAlert([]);
            console.error(error);
        }
    };

    const getMarketEvent = async (value) => {
        const indices = `allStocks?exchangeId=${"1"}&instrumentId=${"1"}`;
        const watchList = `getWatchlist?userId=${email}`;
        const eventType = `flash/getMarketEvent`;
        try {
            let response = [];
            if (value === 1) {
                response = await apiConfigNewsFlash(eventType, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSecondSelectOptions(response.map(item => ({ key: item.eventName, value: item.id })));
            } else if (value === 2) {
                response = await apiConfig(watchList, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSecondSelectOptions(response.map(item => ({ key: item.name, value: item.id })));
            } else if (value === 3) {
                response = await apiConfig(indices, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSecondSelectOptions(response.map(item => ({ key: item.exchangeSymbol, value: item.exchangeSymbol })));
            }
        } catch (error) {
            if (token === "") {
                Cookies.remove("token");
                Cookies.remove("email");
                navigate("/");
            }
            setSecondSelectOptions([]);
            console.error(error);
        }
    };

    const handleKeyTypeChange = (event) => {
        setSelectedKeyType(event.target.value);
    };

    const handleSecondSelectChange = (event) => {
        setSecondSelectValue(event.target.value);
        setAutoFetchAlerts(false);
        getFilterMarketAlert(event.target.value)
    };

    function openInNewTab(url) {
        const newTab = window.open(url, "_blank");
        if (newTab) {
            newTab.focus();
        }
    }

    return (
        <>
            <div style={containerStyle}>
                <header>
                    <Box sx={{ flexGrow: 1 }}>
                        <AppBar color="default" className="app-bar">
                            <Grid
                                container
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Grid item>
                                    <Tooltip title="Go to Home">
                                        <Link to="/interested">
                                            <img src="../../images/logo.png" alt="NDTVPROFIT" />
                                        </Link>
                                    </Tooltip>
                                </Grid>
                                <Grid item>
                                    <Typography variant="h5">
                                        <strong>
                                            <span>Break Out Alerts</span>
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

                <div style={contentStyle}>
                    <Grid
                        container
                        spacing={2}
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Grid item xs={12} sm={6} md={2}>
                            <Paper
                                component="form"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    margin: "0px 0px 10px 0px",
                                    p: "5px",
                                }}
                            >
                                <InputBase
                                    placeholder="Search..."
                                    autoFocus
                                    fullWidth
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <IconButton type="submit" sx={{ p: "2px" }} aria-label="search">
                                    <SearchIcon />
                                </IconButton>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            {/* Empty Grid item */}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} textAlign="right">
                            <FormControl sx={{ m: 1, minWidth: 125 }} size="small">
                                <InputLabel id="demo-select-small-label">SELECT TYPE</InputLabel>
                                <Select
                                    labelId="demo-select-small-label"
                                    id="demo-select-small"
                                    value={selectedKeyType}
                                    onChange={handleKeyTypeChange}
                                    autoWidth
                                    label="SELECT TYPE"
                                >
                                    <MenuItem value="" disabled>
                                        SELECT TYPE
                                    </MenuItem>
                                    {Object.keys(keyType).map((key) => (
                                        <MenuItem key={key} value={keyType[key]}>
                                            {key}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2} textAlign="right">
                            <FormControl sx={{ m: 1, minWidth: 140 }} size="small">
                                <InputLabel id="demo-select-small-label">SELECT LIST</InputLabel>
                                <Select
                                    labelId="demo-select-small-label"
                                    id="demo-select-small"
                                    value={secondSelectValue}
                                    onChange={handleSecondSelectChange}
                                    autoWidth
                                    label="SELECT TYPE"
                                >
                                    <MenuItem value="" disabled>
                                    </MenuItem>
                                    {secondSelectOptions?.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.key.toUpperCase()}
                                        </MenuItem>
                                    ))}

                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={1} textAlign="right">
                            <Button variant="contained" color="primary" onClick={() => getAllAlerts(1)}>
                                All Alerts
                            </Button>
                        </Grid>
                    </Grid>


                    <div style={{ contentStyle, textAlign: 'center' }}>
                        {
                            alert && alert?.length > 0 ?
                                (
                                    alert?.map((item, index) => {
                                        const currentTime = new Date();
                                        const targetTime = new Date(item?.alertTime);
                                        const dateObject = new Date(targetTime);
                                        const formattedTime = dateObject.toLocaleTimeString("en-IN", {
                                            timeZone: "Asia/Kolkata",
                                            hour12: false,
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        });

                                        targetTime.setSeconds(targetTime.getSeconds() + 20);
                                        const isInRange =
                                            currentTime >= new Date(item?.alertTime) &&
                                            currentTime <= targetTime;

                                        return (
                                            <Grid
                                                container
                                                item
                                                key={index}
                                                style={{
                                                    backgroundColor: "white",
                                                    marginBottom: "5px",
                                                    padding: "5px",
                                                    borderRadius: "10px",
                                                    borderLeft: `5px solid ${isInRange ? "green" : "red"}`,
                                                }}
                                            >
                                                <Grid item xs={12} sm={2} onClick={() =>
                                                    openInNewTab(
                                                        `/${item.symbol}/${item.exchangeId}/${item.lastPrice}/${item.prevClose}`
                                                    )
                                                }>
                                                    <Typography variant="h6" style={{ fontWeight: 'bold', cursor: "pointer" }} textAlign={"left"}>
                                                        {`${item.name || "-"}`}
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12} sm={1}>
                                                    <Typography variant="h6" style={{ fontWeight: 'bold' }} textAlign={"left"}>
                                                        {`${item.lastPrice || "-"}`}
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={6} sm={2} textAlign={"left"}>
                                                    <Typography variant="h6" style={{ color: item.percentChange < 0 ? "red" : "green", fontWeight: 'bold' }} color="error">
                                                        {`${item.change?.toFixed(2)} ${item.percentChange < 0 ? '▼' : '▲'} ${item.percentChange?.toFixed(2)}% ` || "-"}
                                                        <span style={{ color: "black", fontSize: "12px" }} color="error">(CMP)</span>
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={6} sm={6} textAlign={"left"}>
                                                    <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                                                        {item.description || '-'}
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={6} sm={1} textAlign={"center"}>
                                                    <Typography variant="h6" style={{ fontWeight: 'bold' }} color="primary">
                                                        {formattedTime || "-"}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        )
                                    })
                                )
                                :
                                (
                                    <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                                        No data found
                                    </Typography>
                                )
                        }
                    </div>
                </div>
            </div >
        </>
    )
}

export default Alerts;

