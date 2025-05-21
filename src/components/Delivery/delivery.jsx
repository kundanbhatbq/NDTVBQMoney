import React, { useEffect, useState } from 'react'
import HomeIcon from "@mui/icons-material/Home";
import { AppBar, Box, Grid, Tooltip, Typography } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { DeliveryTable } from '../../common/common';
import { openDeliveryColumns } from './data';
import Cookies from "js-cookie";
import "./delivery.scss"
import { apiConfig } from '../../commonApi/apiConfig';

const Delivery = () => {

    const [token, setToken] = useState(() => Cookies.get("token") || "");
    const navigate = useNavigate();
    const [delivery, setDelivery] = useState([]);

    

    useEffect(() => {
        const fetchData = async () => {
            const tokenFromCookies = Cookies.get("token");
            if (tokenFromCookies) {
                setToken(tokenFromCookies);
                await getDeliveryStocks();
            } else {
                navigate("/");
            }
        };

        fetchData();
    }, []);

    const getDeliveryStocks = async () => {
        try {
            const response = await apiConfig(
                `getDelivery`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            setDelivery(response);
        } catch (error) {
            if (token === "") {
                Cookies.remove("token");
                Cookies.remove("email");
                navigate("/");
            }
            setDelivery([]);
            console.error(error);
        }
    }

    return (
        <>
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
                                        <span>Stocks Delivery</span>
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
            <Grid className="del-table">
                <div style={{ height: '100%', width: '100%' }}>
                    <DeliveryTable
                        columns={openDeliveryColumns}
                        rows={delivery}
                        density="compact"
                    />
                </div >
            </Grid>
        </>
    )
}

export default Delivery



