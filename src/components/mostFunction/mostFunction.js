import React, { useState, useEffect, useMemo } from 'react';
import { AppBar, Box, Grid, Tooltip, Typography, Dialog, DialogTitle, DialogContent, Button, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import HomeIcon from "@mui/icons-material/Home";
import { DataGrid, GridToolbar, GridOverlay } from '@mui/x-data-grid';
import { apiConfig, apiConfigNewsFlash } from '../../commonApi/apiConfig';
import AttachmentIcon from "@mui/icons-material/Attachment";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import Cookies from 'js-cookie';
import './mostFunction.css';

const NoRowsOverlay = () => (
    <GridOverlay>
        <Typography variant="h6" color="textSecondary">
            No Data
        </Typography>
    </GridOverlay>
);

const MostFunction = () => {
    const [token, setToken] = useState(() => Cookies.get("token") || "");
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState("");
    const [dialogTitle, setDialogTitle] = useState("");
    const [selectedExchange, setSelectedExchange] = useState("NSE");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const tokenFromCookies = Cookies.get("token");
            if (tokenFromCookies) {
                setToken(tokenFromCookies);
                await getTableData(tokenFromCookies);
            } else {
                navigate("/");
            }
        };
    
        // Call fetchData immediately on mount
        fetchData();
    
        // Set up the interval
        const interval = setInterval(() => {
            fetchData();
        }, 10000);
    
        // Cleanup function to clear interval on unmount
        return () => clearInterval(interval);
    }, [navigate]);
    
    const getTableData = async (token) => {
        try {
            const response = await apiConfig('getVolumeComp', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const dataWithIds = response.map((item, index) => ({
                ...item,
                id: index + 1,
                turnOver: (item.lastPrice * item.totalAccVol / 10000000),
                marketCap: (item.lastPrice * item.shareOutstanding / 10000000),
            }));
            setData(dataWithIds);
            filterData(dataWithIds, selectedExchange);
        } catch (error) {
            if (!token) {
                Cookies.remove("token");
                Cookies.remove("email");
                navigate("/");
            }
            setData([]);
            console.error(error);
        }
    };



    const filterData = (data, exchange) => {
        const exchangeId = exchange === "NSE" ? 1 : 2;
        const filtered = data.filter(item => item.exchangeId === exchangeId);
        setFilteredData(filtered);
    };

    const fetchNewsOrAnnouncement = async (symbol, type) => {
        const sanitizedValue = symbol.replace(/&/g, "%26");
        const endpoint = type === 'news' ?
            `flash/getMarketAlert?exchangeSymbol=${sanitizedValue}` :
            `flash/getAnnouncement?exchangeSymbol=${sanitizedValue}`;

        try {
            const response = await apiConfigNewsFlash(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const contents = response.map(item => {
                if (type === 'news') {
                    return {
                        description: item['description']
                    };
                } else if (type === 'announcement') {
                    return {
                        details: item['details'],
                        attachment: item['attachment']
                    };
                }
                return null;
            });

            handleDialogOpen(contents, type === 'news' ? 'Alert' : 'Announcement');
        } catch (error) {
            if (!token) {
                Cookies.remove("token");
                Cookies.remove("email");
                navigate("/");
            }
            handleDialogOpen('Error fetching data. Please try again later.', 'Error');
        }
    };

    const handleDialogOpen = (content, title) => {
        setDialogContent(content);
        setDialogTitle(title);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const renderActionsCell = (params) => (
        <div>
            <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={(event) => {
                    event.stopPropagation();
                    fetchNewsOrAnnouncement(params.row.symbol, "news");
                }}
                style={{ marginRight: 8 }}
            >
                Alert
            </Button>
            <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={(event) => {
                    event.stopPropagation();
                    fetchNewsOrAnnouncement(params.row.symbol, "announcement");
                }}
            >
                Announcement
            </Button>
        </div>
    );

    const columns = useMemo(() => [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'lastPrice', headerName: 'Last Price', flex: 1, type: 'number', valueFormatter: (params) => params.value.toFixed(2) },
        { field: 'percentChange', headerName: '% Change', flex: 1, type: 'number', valueFormatter: (params) => params.value.toFixed(2) },
        { field: 'totalAccVol', headerName: 'Volume', flex: 1, type: 'number' },
        { field: 'avgVolume', headerName: '30-Average Volume', flex: 1, type: 'number' },
        {
            field: 'turnOver', headerName: 'TurnOver', flex: 1, type: 'number', valueFormatter: (params) => {
                return `${params.value?.toFixed(2)} Cr`;
            }
        },
        {
            field: 'marketCap', headerName: 'marketCap', flex: 1, type: 'number', valueFormatter: (params) => {
                return `${params.value?.toFixed(2)} Cr`;
            }
        },
        { field: 'actions', headerName: 'Actions', flex: 1, renderCell: renderActionsCell }
    ], []);

    const handleExchangeChange = (exchange) => {
        setSelectedExchange(exchange);
        filterData(data, exchange);
    };

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
                                <span>Most</span>
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
                        variant={selectedExchange === "NSE" ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => handleExchangeChange("NSE")}
                        sx={{ marginRight: 1 }}
                    >
                        NSE
                    </Button>
                    <Button
                        variant={selectedExchange === "BSE" ? "contained" : "outlined"}
                        color="secondary"
                        onClick={() => handleExchangeChange("BSE")}
                    >
                        BSE
                    </Button>
                </Box>
                <div style={{ height: '100%', width: '100%' }}>
                    <DataGrid
                        rows={filteredData}
                        columns={columns}
                        pageSize={5}
                        checkboxSelection={false}
                        density="compact"
                        disableSelectionOnClick
                        components={{
                            Toolbar: GridToolbar,
                            NoRowsOverlay: NoRowsOverlay,
                        }}
                        sx={{
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#3f51b5',
                                color: '#fff',
                            },
                            '& .MuiDataGrid-cell': {
                                backgroundColor: '#f9f9f9',
                            },
                            '& .MuiDataGrid-footerContainer': {
                                backgroundColor: '#f1f1f1',
                            },
                            '&.MuiDataGrid-root .MuiDataGrid-cell:focus-within': {
                                outline: "none !important",
                            }
                        }}
                    />
                </div>
            </Box>

            <Dialog fullWidth maxWidth="lg" open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>
                    {dialogTitle}
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleCloseDialog}
                    sx={{
                        color: '#fff',
                        position: "absolute",
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ padding: '10px', backgroundColor: '#f5f5f5' }}>
                    <Grid container spacing={2}>
                        {Array.isArray(dialogContent) ? (
                            dialogContent.map((content, index) => (
                                <Grid item xs={12} key={index}>
                                    {content.description && (
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>
                                            {`${index + 1}. ${content.description}`}
                                        </Typography>
                                    )}
                                    {content.details && (
                                        <div>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>
                                                {`${index + 1}. ${content.details}`}
                                            </Typography>
                                            {content.attachment && (
                                                <div>
                                                    {content.attachment.endsWith('.pdf') ? (
                                                        <a href={content.attachment} target="_blank" rel="noopener noreferrer">
                                                            <PictureAsPdfIcon
                                                                style={{
                                                                    color: "red",
                                                                    cursor: "pointer",
                                                                    alignItems: "center",
                                                                }}
                                                            />
                                                        </a>
                                                    ) : (
                                                        <a href={content.attachment} target="_blank" rel="noopener noreferrer">
                                                            <AttachmentIcon
                                                                style={{
                                                                    color: "red",
                                                                    cursor: "pointer",
                                                                    alignItems: "center"
                                                                }}
                                                            />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>{dialogContent}</Typography>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default MostFunction;



