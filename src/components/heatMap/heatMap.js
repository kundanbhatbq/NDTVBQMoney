import React, { useEffect, useState, useMemo, useRef } from 'react';
import './heatMap.css';
import Cookies from "js-cookie";
import { apiConfig } from "../../commonApi/apiConfig";
import { Link, useNavigate } from "react-router-dom";
import { Tooltip, Typography, TextField } from '@mui/material';
import { indicesOptions } from './data';
import html2canvas from 'html2canvas';
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";
import "./heatMap.css"

const HeatMap = () => {
    const [authData, setAuthData] = useState(() => ({
        token: Cookies.get("token") || "",
        email: Cookies.get("email") || ""
    }));
    const [heatMapData, setHeatMapData] = useState([]);
    const [exchange, setExchange] = useState('ALL INDICES');
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
    const dayOfWeek = new Date(startDate).getDay();
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();
    const heatmapRef = useRef(null);
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

    console.log('getCurrentDate', getCurrentDate())

    useEffect(() => {
        const fetchData = async () => {
            if (authData.token && authData.email) {
                await getHeatMap();
            } else {
                navigate("/");
            }
        };
    
        fetchData();
    
        const interval = setInterval(fetchData, 10000);
    
        return () => clearInterval(interval);
    }, [authData, exchange, startDate]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    
    const getHeatMap = async () => {
        const indexOption = indicesOptions.find(option => option.label === exchange);
        if (!indexOption) {
            console.error("Invalid exchange selected.");
            return;
        }

        const indices = indexOption.label.toUpperCase();
        const sanitizedValue = indices.replace(/&/g, "%26");

        try {
            const response = await apiConfig(
                exchange === "ALL INDICES" ?
                getCurrentDate() === startDate ? 
                  `getStocksData?exchangeSymbols=NIFTY 50,SENSEX,NIFTY BANK,NIFTY 500,NIFTY MIDCAP 100,NIFTY SMLCAP 250,NIFTY AUTO,NIFTY CONSR DURBL,NIFTY CPSE,NIFTY ENERGY,NIFTY FIN SERVICE,NIFTY FMCG,NIFTY HEALTHCARE,NIFTY INFRA,NIFTY IT,NIFTY MEDIA,NIFTY METAL,NIFTY OIL AND GAS,NIFTY PHARMA,NIFTY MNC,NIFTY PSU BANK,NIFTY PVT BANK,NIFTY REALTY,NIFTY NEXT 50,NIFTY 100,NIFTY 200,NIFTY MID SELECT,NIFTY IND DEFENCE,NIFTY RURAL, NIFTY CONSUMPTION ` 
                : 
                `getStocksData?exchangeSymbols=NIFTY 50,SENSEX,NIFTY BANK,NIFTY 500,NIFTY MIDCAP 100,NIFTY SMLCAP 250,NIFTY AUTO,NIFTY CONSR DURBL,NIFTY CPSE,NIFTY ENERGY,NIFTY FIN SERVICE,NIFTY FMCG,NIFTY HEALTHCARE,NIFTY INFRA,NIFTY IT,NIFTY MEDIA,NIFTY METAL,NIFTY OIL AND GAS,NIFTY PHARMA,NIFTY MNC,NIFTY PSU BANK,NIFTY PVT BANK,NIFTY REALTY,NIFTY NEXT 50,NIFTY 100,NIFTY 200,NIFTY MID SELECT,NIFTY IND DEFENCE,NIFTY RURAL, NIFTY CONSUMPTION &startDate=${startDate}`
                  
                    :
                    getCurrentDate() === startDate ? 
                    `getIndicesStock?indicesName=${sanitizedValue}&exchangeId=${indexOption.value}`
                    :
                    `getIndicesStock?indicesName=${sanitizedValue}&exchangeId=${indexOption.value}&startDate=${startDate}`

                    ,
                {
                    headers: {
                        Authorization: `Bearer ${authData.token}`,
                    },
                }
            );

            setHeatMapData(response);
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


    const maxLength = useMemo(() => getMaxNameLength(heatMapData), [heatMapData]);
    let maxPositivePercentage = 0;
    let maxNegativePercentage = 0;
    let negativeIndex = 0;
    let bgColor = '#ffffff';
    let greenColor = 0;
    let redColor = 0;
    const renderCards = (cardData) => {

        const sortedData = cardData.slice().sort((a, b) => b.percentChange - a.percentChange);
        return sortedData?.map((card, index) => {

            if (maxPositivePercentage === 0) {
                maxPositivePercentage = card.percentChange;
                greenColor = (100 / maxPositivePercentage) * card.percentChange;
            } else {
                greenColor = 100 + (10 * (index + 1));
            }

            if (maxNegativePercentage === 0 && card.percentChange < 0) {
                maxNegativePercentage = card.percentChange;
                redColor = 255;
                negativeIndex = 2;
            } else {
                redColor = 255 - (255 / sortedData.length * negativeIndex);
                negativeIndex++;
            }

            if (card.percentChange > 0) {
                bgColor = `rgb(0,${greenColor},0)`;
            } else if (card.percentChange < 0) {
                redColor = (redColor === 0) ? 100 : redColor;
                bgColor = `rgb(${redColor},0,0)`;
            }else if (card.percentChange === 0){
                bgColor = `rgb(255,255,255)`;
            }
            return (
                <>

                    <div key={card.id} className="card" style={{ backgroundColor: bgColor, color: card.percentChange === 0 ? "black" : 'white' }}>
                        <div className="perchange" style={{ alignItems: 'center', display: "column" }}>
                            <div>
                                <Typography >{card.name}</Typography>
                            </div>
                            <div>
                                <Typography>{`${card.lastPrice} ${card.percentChange < 0 ? '▼' : '▲'} ${card.percentChange}%`}</Typography>
                            </div>
                        </div>
                    </div>
                </>

            );
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
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
        <div style={{ position: 'relative' }}>

            <button className='heatmap-btn' onClick={handleDownload}><DownloadSharpIcon /></button>
            <div className="select-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <label htmlFor="exchange-select" style={{ marginRight: '8px', whiteSpace: 'nowrap' }}>
            Select Exchange:
        </label>
        
        <select
            id="exchange-select"
            value={exchange}
            onChange={(e) => {
                const selectedExchange = e.target.value;
                if (selectedExchange !== exchange) {
                    setExchange(selectedExchange);
                }
            }}
            className="select-css"
            style={{
                height: '40px',
                width: '200px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                padding: '5px',
               
            }}
        >
            {indicesOptions.map((option) => (
                <option key={option.value} value={option.label}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
    <div>
        <TextField
            id="date-picker"
            type="date"
            value={startDate || ""}
            label="Start Date"
            onChange={(e) => setStartDate(e.target.value)}
            className="input-heatmap-fields"
            sx={{
                width: '200px',
                height: '40px',
                '.MuiInputBase-root': {
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                     background:'white'
                },
                '.MuiInputBase-input': {
                    padding: '10px',
                },
            }}
        />
    </div>
    <div>
    <Typography 
  sx={{
    fontWeight: 'bold', 
    color: 'red', 
    fontSize: '20px'
  }}
>
  {(() => {
      if (startDate === getCurrentDate()) {
          return "(Today)";
      } else {
          if (dayOfWeek === 0 || dayOfWeek === 6) {
              return '';
          } else {
              return ` (Since ${formatDate(startDate)})`;
          }
      }
  })()}
</Typography>

    </div>
</div>

            <div className='container-heatmap' ref={heatmapRef}>
                <div className="input-heatmap-one">
                    {headerVisible ? (
                        <input
                            className="input-heatmap-fields"
                            type="text"
                            id="user-input"
                            value={header}
                            onChange={headerHandleInputChange}
                            onBlur={headerHandleInputBlur}
                            placeholder="Header..."
                        />
                    ) : (
                        <p className="heatmap-headers">
                            <strong>{header}</strong>
                        </p>
                    )}
                </div>

                <div className="input-heatmap-two">
                    {subHeaderVisible ? (
                        <input
                            className="input-heatmap-fields"
                            type="text"
                            id="user-input"
                            value={subHeader}
                            onChange={subHeaderHandleInputChange}
                            onBlur={subHeaderHandleInputBlur}
                            placeholder="SubHeader..."
                        />
                    ) : (
                        <p className="heatmap-subheaders">{subHeader}</p>
                    )}
                </div>
                <div className="heatmap-container">
                {
                        (() => {
                            if (dayOfWeek === 0 || dayOfWeek === 6) {
                                return <h1 style={{ display: 'flex', justifyContent: 'center', color: "red" }}>Market Closed</h1>;
                            } else {
                                return renderCards(heatMapData, maxLength);

                            };
                        }
                        )()
                    }
                   
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
                            {`Source : ${exchange === 'SENSEX' ? 'BSE' : exchange === 'ALL INDICES' ? 'NSE/BSE' : 'NSE'}`}
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
            </div>
        </div>
    );
};

export default HeatMap;

function getMaxNameLength(cardData) {
    return cardData?.reduce((maxLength, card) => Math.max(maxLength, card.name.length), 0);
}



