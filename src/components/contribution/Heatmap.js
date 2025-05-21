import React, { useEffect, useState, useRef } from 'react';
import '../heatMap/heatMap.css';
import Cookies from "js-cookie";
import { graphConfig, apiConfig,apiConfigTicker } from "../../commonApi/apiConfig";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Tooltip, Typography, Grid } from '@mui/material';
import html2canvas from 'html2canvas';
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

const SectorHeatmap = () => {
    const [authData, setAuthData] = useState(() => ({
        token: Cookies.get("token") || "",
        email: Cookies.get("email") || ""
    }));
    const [heatMapData, setHeatMapData] = useState([]);
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
    const [header, setHeader] = useState("");
    const [subHeader, setSubHeader] = useState("");
    const [headerVisible, setHeaderVisible] = useState(true);
    const [subHeaderVisible, setSubHeaderVisible] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();
    const heatmapRef = useRef();
    const [totalPoints, setTotalPoints] = useState(0);
    const [niftyPrice, setNiftyPrice] = useState(null);
    const [prevClose, setPrevClose] = useState()

    const [sectorValue, setSectorValue] = useState(1)
    const ChangePercent = ((totalPoints / (niftyPrice - totalPoints)) * 100).toFixed(2)
    const dayOfWeek = new Date(startDate).getDay();

    let groupedData; 


console.log('heatMapData', heatMapData, sectorValue )




    useEffect(() => {
        let intervalId;

        const fetchData = async () => {
            if (authData.token && authData.email) {
                await getHeatMap();
                await getIndices(); // Fetch Nifty 50 data
                await getChangePercentData()
            } else {
                navigate("/");
            }
        };

        if (authData.token && authData.email) {
            fetchData(); // Initial fetch
            intervalId = setInterval(fetchData, 4000); // Fetch every 5 seconds
        }

        return () => clearInterval(intervalId); // Clean up the interval on unmount
    }, [authData.token, authData.email, startDate, sectorValue]); // Dependencies include authData and startDate

    // useEffect(() => {
    //     if (authData.token && authData.email) {
    //         getIndices(); // Fetch Nifty 50 data when authData changes
    //     }
    // }, [authData.token, authData.email]);

    useEffect(() => {
        setCurrentTime(new Date()); // Set the current time once when the component mounts
    }, []); // No interval needed

    const getHeatMap = async () => {
        try {
            let url=`tickersectorst?exchangeSymbol=NIFTY%2050`;
        

            const response = await apiConfig(url,   {
                headers: {
                    Authorization: `Bearer ${authData.token}`,
                },
            })

    
            if(sectorValue === 1){
     // Group the data by sectorName and sum the points
     groupedData  = response.reduce((acc, card) => {
        if (!acc[card.sectorName]) {
            acc[card.sectorName] = {
                sectorName: card.sectorName,
                totalPoints: 0
            };
        }
        acc[card.sectorName].totalPoints += card.pointsPercentChange;
        return acc;
    }, {});

    const totalPoints = Object.values(groupedData).reduce((sum, card) => sum + card.totalPoints, 0);
    setTotalPoints(totalPoints); // Set total points for display

    // Convert groupedData object to an array of sectors with total points
    setHeatMapData(Object.values(groupedData));
            } else if(sectorValue === 2){
                     // Group the data by sectorName and sum the points
           groupedData = response.reduce((acc, card) => {
                if (!acc[card.industryName]) {
                    acc[card.industryName] = {
                        industryName: card.industryName,
                        totalPoints: 0
                    };
                }
                acc[card.industryName].totalPoints += card.pointsPercentChange;
                return acc;
            }, {});

            const totalPoints = Object.values(groupedData).reduce((sum, card) => sum + card.totalPoints, 0);
            setTotalPoints(totalPoints); // Set total points for display

            // Convert groupedData object to an array of sectors with total points
            setHeatMapData(Object.values(groupedData));
            } else if(sectorValue === 3) {

               
           groupedData = response.reduce((acc, card) => {
            if (!acc[card.basicIndustry]) {
                acc[card.basicIndustry] = {
                    basicIndustry: card.basicIndustry,
                    totalPoints: 0
                };
            }
            acc[card.basicIndustry].totalPoints += card.pointsPercentChange;
            return acc;
        }, {});

        const totalPoints = Object.values(groupedData).reduce((sum, card) => sum + card.totalPoints, 0);
    
        setTotalPoints(totalPoints); // Set total points for display
        setHeatMapData(Object.values(groupedData));
                
            }
       

        } catch (error) {
            if (!authData.token) {
                Cookies.remove("token");
                Cookies.remove("email");
                setAuthData({ token: "", email: "" });
                navigate("/");
            }
            setHeatMapData([]);
            console.error(error);
        }
    };

    const getChangePercentData = async () => {
        try {

            let url;
            if (startDate === getCurrentDate()) {
                url = `getLineGraphLt?exchangeSymbol=NIFTY%2050&graphType=dateToDate&startDate=${getYesterdayDate()}&endDate=${getCurrentDate()}`;
            } else {
                url = `getLineGraphLt?exchangeSymbol=NIFTY%2050&graphType=dateToDate&startDate=${startDate}&endDate=${getCurrentDate()}`;
            }


            const response = await graphConfig(
                url, // Assuming id is available in the scope
                {
                    headers: {
                        Authorization: `Bearer ${authData.token}`,
                    },
                }
            );

            setPrevClose(response.prevClose)




        } catch (error) {
            console.error("Error fetching data:", error);
        }

    }
    const getIndices = async () => {
        try {
            const response = await apiConfig(
                `allStocks?exchangeId=1&instrumentId=1`, // Assuming id is available in the scope
                {
                    headers: {
                        Authorization: `Bearer ${authData.token}`,
                    },
                }
            );

            // Extract the Nifty 50 price and name from the response
            const niftyStock = response.find(stock => stock.name === 'Nifty 50');

            if (niftyStock) {
                setNiftyPrice(niftyStock.lastPrice);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };


    const handleDownload = () => {
        if (heatmapRef.current) {
            const container = heatmapRef.current;

            const width = container.offsetWidth;

            const height = width * (7 / 14);

            html2canvas(container, { width, height }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'heatmap.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };

    
    const renderCards = (cardData) => {
        let maxPositivePercentage = 0;
        let maxNegativePercentage = 0;
        let negativeIndex = 0;
        let bgColor = '#ffffff';
        let greenColor = 0;
        let redColor = 0;

        const sortedData = cardData.slice().sort((a, b) => b.totalPoints - a.totalPoints); // Sort by totalPoints

        return sortedData?.map((card, index) => {
            // Logic for calculating the green color for positive values
            if (maxPositivePercentage === 0 && card.totalPoints > 0) {
                maxPositivePercentage = card.totalPoints;
                greenColor = (100 / maxPositivePercentage) * card.totalPoints;
            } else if (card.totalPoints > 0) {
                greenColor = 100 + (10 * (index + 1)); // Darker green for higher values
            }

            // Logic for calculating the red color for negative values
            if (maxNegativePercentage === 0 && card.totalPoints < 0) {
                maxNegativePercentage = card.totalPoints;
                redColor = 255;
                negativeIndex = 2;
            } else if (card.totalPoints < 0) {
                redColor = 255 - (255 / sortedData.length * negativeIndex); // Lighter red as values approach zero
                negativeIndex++;
            }

            // Determine the background color based on totalPoints
            if (card.totalPoints > 0) {
                bgColor = `rgb(0,${greenColor},0)`; // Darker green for higher values
            } else if (card.totalPoints < 0) {
                redColor = redColor === 0 ? 100 : redColor; // Prevent redColor from becoming zero
                bgColor = `rgb(${redColor},0,0)`; // Darker red for more negative values
            } else if (card.totalPoints === 0) {
                bgColor = `rgb(255,255,255)`; // White for zero
            }

            return (
                <div key={card.sectorName} className="card" style={{ backgroundColor: bgColor, color: card.totalPoints === 0 ? "black" : 'white' }}>
                    <div className="perchange" style={{ alignItems: 'center', display: "column", height: "80px" }}>
                            
                        <Typography sx={{ fontSize: '14px' }}>    {
                        (() => {
                            if (sectorValue === 1 ) {
                                return card.sectorName;
                            } else if (sectorValue === 2) {
                                return card.industryName;
                            }
                            else if (sectorValue === 3){
                                return card.basicIndustry;
                            };
                        }
                        )()
                    }  </Typography>
                        <Typography>{` ${card.totalPoints.toFixed(2)}`}</Typography>
                    </div>
                </div>
            );
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

    const getYesterdayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        let month = today.getMonth() + 1;
        let day = today.getDate() - 1;

        // Pad month and day with zero if less than 10
        if (month < 10) {
            month = `0${month}`;
        }
        if (day < 10) {
            day = `0${day}`;
        }

        return `${year}-${month}-${day}`;
    };



    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

    return (


        <div style={{ position: 'relative' }}>
            <button className='heatmap-btn' onClick={handleDownload}><DownloadSharpIcon /></button>

            <div className="select-container" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row'
            }} >
              
             

            </div>




            <Grid className='container-heatmap' ref={heatmapRef} sx={{ height: '500px', marginBottom: '10px' }}>

                <div className="input-heatmap-one">
                    {headerVisible ? (
                        <input
                            className="input-heatmap-fields"
                            type="text"
                            value={header}
                            onChange={headerHandleInputChange}
                            onBlur={headerHandleInputBlur}
                            placeholder="Header..."
                        />
                    ) : (
                        <p className="heatmap-headers"><strong>{header}</strong></p>
                    )}
                </div>

                <div className="input-heatmap-two">
                    {subHeaderVisible ? (
                        <input
                            className="input-heatmap-fields"
                            type="text"
                            value={subHeader}
                            onChange={subHeaderHandleInputChange}
                            onBlur={subHeaderHandleInputBlur}
                            placeholder="SubHeader..."
                        />
                    ) : (
                        <p className="heatmap-subheaders">{subHeader}</p>
                    )}


                </div>

                {/* <Grid sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>

                    <div >
                        {niftyPrice && (
                            <Typography variant="h5" sx={{ fontWeigh: "bold" }}>
                                {`Nifty 50: ${niftyPrice.toFixed(2)}`}
                            </Typography>
                        )}
                    </div>

                    <Typography
                        variant="h5"
                        sx={{
                            marginLeft: '10px',
                            color: totalPoints > 0 ? 'green' : 'red',
                            display: 'flex',
                            alignItems: 'center',

                        }}
                    >
                        {totalPoints > 0 ? (
                            <>

                                <ArrowUpwardIcon sx={{ marginRight: '5px', display: 'flex', alignItems: 'center' }} /> {totalPoints.toFixed(2)}
                            </>
                        ) : (
                            <>

                                <ArrowDownwardIcon sx={{ marginRight: '5px', display: 'flex', alignItems: 'center' }} /> {totalPoints.toFixed(2)}
                            </>
                        )}
                    </Typography>


                    <Typography
                        variant="h5"
                        sx={{
                            marginLeft: '10px',
                            color: totalPoints > 0 ? 'green' : 'red',
                            display: 'flex',
                            alignItems: 'center',

                        }}
                    >
                        {totalPoints > 0 ? (
                            <>

                                <ArrowUpwardIcon sx={{ marginRight: '5px' }} /> {`${ChangePercent}%`}
                            </>
                        ) : (
                            <>

                                <ArrowDownwardIcon sx={{ marginRight: '5px' }} />  {`${ChangePercent}%`}
                            </>
                        )}
                    </Typography>

                    <Typography variant='h6' sx={{ marginLeft: '10px' }}>
                        {
                            (() => {
                                if (startDate === getCurrentDate()) {
                                    return "(Today)";
                                } else {

                                    if (dayOfWeek === 0 || dayOfWeek === 6) {
                                        return ''
                                    } else {
                                        return ` (Since ${formatDate(startDate)})`

                                    };
                                }
                            })()
                        }
                    </Typography>

                </Grid> */}


                <div className="heatmap-container">

                    {
                        (() => {
                            if (dayOfWeek === 0 || dayOfWeek === 6) {
                                return <h1 style={{ display: 'flex', justifyContent: 'center', color: "red" }}>Market Closed</h1>;
                            } else {
                                return renderCards(heatMapData);

                            };
                        }
                        )()
                    }

                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" fontWeight="bold">
                        Date: {currentTime.toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                        Time: {formattedTime}
                    </Typography>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6" fontWeight="bold">
                        Source: NSE
                    </Typography>

                    <Typography sx={{ marginTop: '14px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Tooltip title="Go to Home">
                            <Link to="/interested">
                                <img src="../../../images/logo.png" alt="NDTVPROFIT" className="NDTV-logo" />
                            </Link>
                        </Tooltip>
                    </Typography>
                </div>

            </Grid>


        </div>

    );
};

export default SectorHeatmap;
