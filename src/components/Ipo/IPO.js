import React, { useState, useEffect, useMemo } from 'react';
import { AppBar, Box, Grid, Tooltip, Typography, Dialog, DialogTitle, DialogContent, Button, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import HomeIcon from "@mui/icons-material/Home";
import { DataGrid, GridToolbar, GridOverlay } from '@mui/x-data-grid';
import { apiConfig, apiConfigNewsFlash } from '../../commonApi/apiConfig';

import Cookies from 'js-cookie';
import './IPO.css';

const NoRowsOverlay = () => (
    <GridOverlay>
        <Typography variant="h6" color="textSecondary">
            No Data
        </Typography>
    </GridOverlay>
);


const IPO = () => {
    const [token, setToken] = useState(() => Cookies.get('token') || '');
    const [data, setData] = useState([]);

    const [selectedExchange, setSelectedExchange] = useState(1);
    const navigate = useNavigate();

 

    useEffect(() => {
        const fetchData = async () => {
            const tokenFromCookies = Cookies.get('token');
            if (tokenFromCookies) {
                setToken(tokenFromCookies);
                await getTableData(tokenFromCookies);
            } else {
                navigate('/');
            }
        };

        fetchData();
    }, [navigate]);

 
      useEffect(() => {
       
       
        const intervalId = setInterval(() => {
            getTableData(token);
        }, 1000); 

      
        return () => clearInterval(intervalId);


    }, [token, selectedExchange]);

    const getTableData = async (token) => {
        try {
            const response = await apiConfig(`getIpo?exchangeId=${selectedExchange}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const formattedData = response.map((item, index) => ({
                id: index + 1,
                exchangeSymbol: item.exchangeSymbol,
                name: item.name,
                listingPrice: item.listingPrice,
                issueDate: item.issueDate,
                oneWeekPer: item.oneWeekPer,
                oneMonthPer: item.oneMonthPer,
                threeMonthPer: item.threeMonthPer,
                sixMonthPer: item.sixMonthPer,
                oneYearPer: item.oneYearPer,
                listDatePer: item.listDatePer,
                listToDatePer: item.listToDatePer,
                marketCap: item.marketCap,
                lastPrice: item.lastPrice,
                sectorName : item.sectorName,
                industryName : item.industryName,
                basicIndustryName : item.basicIndustryName
            }));
            console.log(formattedData);

            setData(formattedData);


            // 
        } catch (error) {
            if (!token) {
                Cookies.remove('token');
                Cookies.remove('email');
                navigate('/');
            }
            setData([]);
            console.error(error);
        }
    };


    const handleExchangeChange = (exchange) => {
        setSelectedExchange(exchange);
    };

    const columns = [

        { field: 'exchangeSymbol', headerName: 'Exchange Symbol', flex: 1 , minWidth: 200
        },
        { field: 'name', headerName: 'Name', flex: 1 , minWidth: 200},
      
        { field: 'listingPrice', headerName: 'Adj Issue Price', flex: 1, type: 'number', minWidth: 200, cellClassName: (params) => {
            if (params.value < 0) {
                return 'negative-value';
            } else if (params.value === 0) {
                return 'neutral-value';
            } else {
                return 'positive-value';
            }
        } },
        { field: 'lastPrice', headerName: 'CMP', flex: 1, type: 'number', minWidth: 200 ,cellClassName: (params) => {
            if (params.value < 0) {
                return 'negative-value';
            } else if (params.value === 0) {
                return 'neutral-value';
            } else {
                return 'positive-value';
            }
        } },
        { field: 'issueDate', headerName: 'Listing Date', flex: 1, type: 'Date', minWidth: 200  },
        {
            field: 'listDatePer',
            headerName: 'Listing Day %',
            flex: 1,
            type: 'number'
            , minWidth: 200 ,
            valueFormatter: (params) => {
                return `${params.value?.toFixed(2)}`;
            },
            cellClassName: (params) => {
                if (params.value < 0) {
                    return 'negative-value';
                } else if (params.value === 0) {
                    return 'neutral-value';
                } else {
                    return 'positive-value';
                }
            },
        }
        ,
        {
            field: 'oneWeekPer', headerName: '1 Week %', flex: 1, type: 'number' , minWidth: 200 ,
            cellClassName: (params) => {
                if (params.value < 0) {
                    return 'negative-value';
                } else if (params.value === 0) {
                    return 'neutral-value';
                } else {
                    return 'positive-value';
                }
            },
            valueFormatter: (params) => {
                return `${params.value?.toFixed(2)}`;
            }
        },
        {
            field: 'oneMonthPer', headerName: '1 Month %', flex: 1, type: 'number', minWidth: 200 ,
            cellClassName: (params) => {
                if (params.value < 0) {
                    return 'negative-value';
                } else if (params.value === 0) {
                    return 'neutral-value';
                } else {
                    return 'positive-value';
                }
            },
            valueFormatter: (params) => {
                return `${params.value?.toFixed(2)}`;
            }
        },
        {
            field: 'threeMonthPer', headerName: '3 Month %', flex: 1, type: 'number', minWidth: 200 ,
            cellClassName: (params) => {
                if (params.value < 0) {
                    return 'negative-value';
                } else if (params.value === 0) {
                    return 'neutral-value';
                } else {
                    return 'positive-value';
                }
            }
        },
        {
            field: 'sixMonthPer', headerName: '6 Month %', flex: 1, type: 'number', minWidth: 200 ,
            cellClassName: (params) => {
                if (params.value < 0) {
                    return 'negative-value';
                } else if (params.value === 0) {
                    return 'neutral-value';
                } else {
                    return 'positive-value';
                }
            }
        },
        {
            field: 'oneYearPer', headerName: '1 Year %', flex: 1, type: 'number', minWidth: 200 ,
            cellClassName: (params) => {
                if (params.value < 0) {
                    return 'negative-value';
                } else if (params.value === 0) {
                    return 'neutral-value';
                } else {
                    return 'positive-value';
                }
            }
        },

        {
            field: 'listToDatePer',
            headerName: 'List to Date %',
            flex: 1,
            type: 'number', minWidth: 200 ,
            valueFormatter: (params) => {
                return `${params.value?.toFixed(2)}`;
            },

            cellClassName: (params) => {
                if (params.value < 0) {
                    return 'negative-value';
                } else if (params.value === 0) {
                    return 'neutral-value';
                } else {
                    return 'positive-value';
                }
            }
        },
        {
            field: 'marketCap',
            headerName: 'Market Cap (Cr)',
            flex: 1,
            type: 'number',
            minWidth: 200 ,
            valueFormatter: (params) => {
                return `${(params.value / 10000000).toFixed(2)} `;
            },
            cellClassName: (params) => {
                if (params.value < 0) {
                    return 'negative-value';
                } else if (params.value === 0) {
                    return 'neutral-value';
                } else {
                    return 'positive-value';
                }
            }
        },
        { field: 'sectorName', headerName: 'Sector', flex: 1, minWidth: 200  },
        { field: 'industryName', headerName: 'Industry', flex: 1 , minWidth: 200 },
        { field: 'basicIndustryName', headerName: 'Basic Industry', flex: 1, minWidth: 200  },
        

    ];


    return (
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
                                <span>IPO</span>
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

            <Box mt={8} mx={2}>
                <Box display="flex" justifyContent="center" mb={2}>
                    <Button
                        variant={selectedExchange === 1 ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => handleExchangeChange(1)}
                        sx={{ marginRight: 1 }}
                    >
                        NSE
                    </Button>
                    <Button
                        variant={selectedExchange === 2 ? 'contained' : 'outlined'}
                        color="secondary"
                        onClick={() => handleExchangeChange(2)}
                    >
                        BSE
                    </Button>
                </Box>
                <div style={{ height: '100%', width: '100%' }}>
                    <DataGrid
                        rows={data}
                        columns={columns}
                        pageSize={5}
                        checkboxSelection={false}
                        density="compact"
                        disableSelectionOnClick
                        components={{
                            Toolbar: GridToolbar,
                        }}
                        sx={{
                            '& .MuiDataGrid-columnHeader': {
                                backgroundColor: '#3f51b5',
                                color: '#fff',
                                width:'200px'
                            },
                            '& .MuiDataGrid-cell': {
                                backgroundColor: '#f9f9f9',
                                 width:'200px'


                            },
                            '& .MuiDataGrid-footerContainer': {
                                backgroundColor: '#f1f1f1',
                            },
                            '&.MuiDataGrid-root .MuiDataGrid-cell:focus-within': {
                                outline: 'none !important',
                            },
                           
                        }}
                    />
                </div>
            </Box>
        </Box>
    );
};

export default IPO;



