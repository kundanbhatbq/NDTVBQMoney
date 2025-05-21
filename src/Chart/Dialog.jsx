import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./dialog.css";
import { apiConfig } from "../commonApi/apiConfig";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import DownloadSharpIcon from "@mui/icons-material/DownloadSharp";

const CommonDialog = ({ open, handleClose, title, name }) => {
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  const [currentTime, setCurrentTime] = useState(new Date());
  const dialogContentRef = useRef(null);
  const [stocks, setStocks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const tokenFromCookies = Cookies.get("token");
      if (tokenFromCookies) {
        setToken(tokenFromCookies);
        await getStocks();
      } else {
        navigate("/");
      }
    };

    fetchData();

    const stocksInterval = setInterval(() => {
      getStocks();
    }, 5000);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(stocksInterval);
      clearInterval(timeInterval);
    };
  }, [token]);

  const getStocks = async () => {
    const isSymbol = `dashboard?exchangeSymbol=${name}`;
    try {
      const response = await apiConfig(`${isSymbol}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
     console.log("response", response)
      setStocks(response); // Assuming you want to set stocks with response data
    } catch (error) {
      if (!token) {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
      setStocks([]);
      console.error(error);
    }
  };

  function getClassName(change) {
    if (change > 0) {
      return "green-span";
    } else if (change === 0) {
      return "blue-span";
    } else {
      return "red-span";
    }
  }

  const handleDownload = () => {
    if (dialogContentRef.current) {
      const container = dialogContentRef.current;
      const width = container.offsetWidth;
      const height = width * (8 / 16);

      html2canvas(container, { width, height }).then((canvas) => {
        const link = document.createElement("a");
        link.download = `${name}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const formattedTime =
    currentTime.getHours() +
    ":" +
    (currentTime.getMinutes() < 10 ? "0" : "") +
    currentTime.getMinutes();

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
      <Grid ref={dialogContentRef}>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {" "}
          {`${title} `}
        </DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignstockss: "center",
          }}
        >
    <table>
  <tbody>
    <tr className="inner-container">
      <td className="text">
        <span className="first-span">Last Price</span>
        <span className={getClassName(stocks.change)}>
          {stocks.lastPrice?.toFixed(2)}
        </span>
      </td>
      <td className="text">
        <span className="first-span">Open</span>
        <span className={getClassName(stocks.change)}>
          {stocks.open?.toFixed(2)}
        </span>
      </td>
      <td className="text">
        <span className="first-span">High</span>
        <span className={getClassName(stocks.change)}>
          {stocks.high?.toFixed(2)}
        </span>
      </td>
      <td className="text">
        <span className="first-span">Low</span>
        <span className={getClassName(stocks.change)}>
          {stocks.low?.toFixed(2)}
        </span>
      </td>
      <td className="text">
        <span className="first-span">Prev Close</span>
        <span className={getClassName(stocks.change)}>
          {stocks.prevClose?.toFixed(2)}
        </span>
      </td>
    </tr>

    <tr className="inner-container">
     
      <td className="text">
        <span className="first-span">Chg/%Chg</span>
        <span className={getClassName(stocks.change)}>
          {`${stocks.change?.toFixed(2)} / ${stocks.changePerc?.toFixed(2)}%`}
        </span>
      </td>
      <td className="text">
        <span className="first-span">Vol/30-Day-Vol</span>
        <span className={getClassName(stocks.change)}>
          {`${stocks.volume} / ${stocks.volume30Avg}`}
        </span>
      </td>
      <td className="text">
        <span className="first-span">All Time High/Low</span>
        <span className={getClassName(stocks.change)}>
          {`${stocks.highAll?.toFixed(2)} / ${stocks.lowAll?.toFixed(2)}`}
        </span>
      </td> <td className="text">
        <span className="first-span">Highest/Lowest Since</span>
        <span className={getClassName(stocks.change)}>
          {`${new Date(stocks.highAllDate).toLocaleDateString("en-GB")} / ${new Date(stocks.lowAllDate).toLocaleDateString("en-GB")}`}
        </span>
      </td>

    </tr>

    <tr className="inner-container">
     
      <td className="text">
        <span className="first-span">TurnOver(Rs. Cr)</span>
        <span className={getClassName(stocks.change)}>
          {`${(((stocks.volume ?? 0) * (stocks.lastPrice ?? 0)) / 10000000).toFixed(2)}`}
        </span>
      </td>

      <td className="text">
        <span className="first-span">Market Cap Gain/Loss (Rs. Cr)</span>
        <span className={getClassName(stocks.change)}>
          {`${(((stocks.marketCap ?? 0) - (stocks.prevMarketCap ?? 0)) / 10000000).toFixed(2)}`}
        </span>
      </td>

      <td className="text">
        <span className="first-span">Market Cap(Rs. Cr)</span>
        <span className={getClassName(stocks.change)}>
          {`${((stocks.marketCap ?? 0) / 10000000).toFixed(2)}`}
        </span>
      </td>

      <td className="text">
        <span className="first-span">YTD %Chg/12-M %Chg</span>
        <span className={getClassName(stocks.change)}>
          {`${((((stocks.lastPrice ?? 0) - (stocks.closeThisYear ?? 0)) / (stocks.closeThisYear ?? 1)) * 100).toFixed(2)}% / ${((((stocks.lastPrice ?? 0) - (stocks.close1Year ?? 0)) / (stocks.close1Year ?? 1)) * 100).toFixed(2)}%`}
        </span>
      </td>
    
    </tr>

    <tr className="inner-container">
    <td className="text">
        <span className="first-span">RSI</span>
        <span className={getClassName(stocks.change)}>
          {stocks.rsi?.toFixed(2)}
        </span>
      </td>
     
      <td className="text">
        <span className="first-span">50 DMA</span>
        <span className={getClassName(stocks.change)}>
          {stocks.dma50?.toFixed(2)}
        </span>
      </td>
      <td className="text">
        <span className="first-span">100 DMA</span>
        <span className={getClassName(stocks.change)}>
          {stocks.dma100?.toFixed(2)}
        </span>
      </td>
      <td className="text">
        <span className="first-span">200 DMA</span>
        <span className={getClassName(stocks.change)}>
          {stocks.dma200?.toFixed(2)}
        </span>
      </td>
    </tr>

    <tr className="inner-container">
      <td className="text">
        <span className="first-span">PE</span>
        <span className={getClassName(stocks.change)}>
          {stocks.pe?.toFixed(2)}
        </span>
      </td>
      <td className="text">
  <span className="first-span">Biggest IntraDay %Gain/%Loss Since</span>
  <span className={getClassName(stocks.change)}>
    {`${stocks.biggestIntraGain?.toFixed(2)}% (${new Date(stocks.biggestIntraGainDate).toLocaleDateString("en-GB")}) / ${stocks.biggestIntraLoss?.toFixed(2)}%  (${new Date(stocks.biggestIntraLossDate).toLocaleDateString("en-GB")})`}
  </span>
</td>

      <td className="text">
        <span className="first-span">52-W High/Low</span>
        <span className={getClassName(stocks.change)}>
          {`${stocks.high52Week?.toFixed(2)} / ${stocks.low52Week?.toFixed(2)}`}
        </span>
      </td>
      <td className="text">
        <span className="first-span">Last 52-W High/Low Level</span>
        <span className={getClassName(stocks.change)}>
          {`${new Date(stocks.high52WeekDate).toLocaleDateString("en-GB")} / ${new Date(stocks.low52WeekDate).toLocaleDateString("en-GB")}`}
        </span>
      </td>
    </tr>

    <tr className="inner-container">
  <td
    colSpan="4"
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '20px',
     
    }}
  >
    <Typography style={{ fontWeight: 'bold' }}>
      Date: {currentTime.toLocaleDateString('en-GB')}
    </Typography>
    <Typography style={{ fontWeight: 'bold' }}>
      Time: {formattedTime}
    </Typography>
    <Typography style={{ fontWeight: 'bold' }}>
    *With reference to 10-year data
    </Typography>
   
  </td>
</tr>


  </tbody>
</table>



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
        </DialogContent>
      </Grid>

      <IconButton
        aria-label="download"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
      <IconButton
        aria-label="download"
        onClick={handleDownload}
        sx={{
          position: "absolute",
          right: 40,
          top: 10,
        }}
      >
        <DownloadSharpIcon />
      </IconButton>
    </Dialog>
  );
};

export default CommonDialog;
