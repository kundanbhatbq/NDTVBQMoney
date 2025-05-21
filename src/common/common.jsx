import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  TextField,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tab,
  Box,
  Tabs,
  FormControl,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tooltip,
  TableFooter
} from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import InfoIcon from "@mui/icons-material/Info";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";
import {
  apiConfigPostChange,
  apiConfigPost,
  apiConfigNewsFlash,
} from "../commonApi/apiConfig";
import BarChartIcon from '@mui/icons-material/BarChart';
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import "./index.scss";
import ColumnChart from "../Chart/ColumnChart";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { MillionFormatter, NumberFormatter } from "./helper";

export const CommonTabs = (props) => {
  const { headers, onMenuChange, value, handleDeleteClick } = props;

  return (
    <Box
      sx={{
        flexGrow: 1,
        maxWidth: "100%",
      }}
    >
      <Tabs
        value={value}
        onChange={onMenuChange}
        style={{ minHeight: 32, height: 32 }}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {headers?.map((header, index) => (
          <Tab
            key={index}
            label={header?.name}
            style={{ minHeight: 32, height: 32 }}
            icon={
              Number.isInteger(value) && value >= 0 ? (
                <DeleteForeverIcon
                  className="delete-icon"
                  style={{ fontSize: 20, cursor: "pointer" }}
                  onClick={(e) => handleDeleteClick(e, index)}
                />
              ) : (
                ""
              )
            }
            iconPosition="end"
            sx={{
              fontWeight: "bold",
              backgroundColor: "#265073",
              color: "#fff",
              border: "1px solid #ccc",
              margin: "0px 0px 0px 2px",
              borderRadius: "3px",
              boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export const SnackbarPopup = (props) => {
  const { snackBarOpen, responseStatus, handleSnackbarClose, severity } = props;

  return (
    <div>
      {responseStatus && responseStatus?.message && (
        <Snackbar
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          open={snackBarOpen}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={severity}
            sx={{ width: "100%" }}
          >
            {responseStatus?.message}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

export const ChangePasswordPopup = ({
  open,
  handleClose,
  setSnackBarOpen,
  setResponseStatus,
  setSeverity,
  token,
  email,
}) => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handlePasswordChange = async () => {
    try {
      if (!confirmPassword || !password) {
        throw new Error("Password and confirmation are required.");
      }

      if (password !== confirmPassword) {
        throw new Error("Password and confirmation do not match.");
      }

      const payload = {
        username: email,
        password: password,
      };

      const response = await apiConfigPost("auth/changePassword", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
        throw new Error("Unauthorized access. Please check your credentials.");
      }
      setSnackBarOpen(true);
      setSeverity("success");
      Cookies.remove("token");
      Cookies.remove("email");
      navigate("/");
      setResponseStatus({ message: "Password changed successfully" });
    } catch (err) {
      console.error(err);
      setSnackBarOpen(true);
      setSeverity("error");
      setResponseStatus({ message: err.message });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle style={{ backgroundColor: "#9400d3", color: "white" }}>
        Change Password
        <IconButton
          aria-label="close"
          color="inherit"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <form>
          <TextField
            focused
            autoFocus
            label="Password"
            variant="outlined"
            margin="normal"
            fullWidth
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="Confirm Password"
            variant="outlined"
            margin="normal"
            fullWidth
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handlePasswordChange}
        >
          Change
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const StockDetailsDialog = ({
  open,
  onClose,
  title,
  onAddStock,
  userId,
  token,
  navigate,
  setSnackBarOpen,
  setResponseStatus,
  setSeverity,
}) => {
  const [userInput, setUserInput] = useState("");

  const saveWatchlist = async () => {
    const payload = {
      userId: userId,
      watchlist: userInput,
    };
    try {
      const response = await apiConfigPostChange(`saveWatchlist`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response) {
        const stockNames = response.map((data) => ({
          name: data.name,
          id: data.id,
        }));
        onAddStock(stockNames);
        console.log("Watchlist added successfully");
      } else {
        throw new Error("Failed to add watchlist");
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      } else {
        console.error(err);
        setSnackBarOpen(true);
        setResponseStatus({ message: err.message });
      }
    }
  };

  const handleAddClick = () => {
    if (userInput) {
      saveWatchlist();
      setUserInput("");
      onClose();
    } else {
      setSnackBarOpen(true);
      setSeverity("error");
      setResponseStatus({ message: "Please Enter Watchlist" });
    }
  };

  const handleEnterPress = (e) => {
    if (e.key === "Enter") {
      handleAddClick();
    }
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle
        sx={{ m: 0, p: 2 }}
        id="customized-dialog-title"
        style={{
          fontSize: "18px",
          fontWeight: "bolder",
        }}
      >
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <FormControl variant="standard" fullWidth>
            <TextField
              id="new-comment"
              label="watchlist"
              placeholder="Enter your watchlist"
              focused
              autoFocus
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleEnterPress}
              inputProps={{
                maxLength: 20,
              }}
            />
          </FormControl>
          <Button
            sx={{
              width: "100%",
            }}
            variant="contained"
            color="primary"
            onClick={handleAddClick}
          >
            ADD
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export const GraphWithMonthSelection = ({
  title,
  monthDataOptions,
  searchValue,
}) => {
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  const [active, setActive] = useState("1m");
  const navigate = useNavigate();
  const [futuresGraph, setFuturesGraph] = useState([]);
  const [selectedOption, setSelectedOption] = useState(
    Object.keys(monthDataOptions)?.[1]
  );
  let sanitizedValue = searchValue?.replace(/&/g, "%26");

  useEffect(() => {
    const fetchData = async () => {
      const tokenFromCookies = Cookies.get("token");
      if (tokenFromCookies) {
        setToken(tokenFromCookies);
        await getFuturesGraph();
      } else {
        navigate("/");
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 15000);
    return () => clearInterval(intervalId);
  }, [active, searchValue]);

  useEffect(() => {
    setActive(monthDataOptions[selectedOption][0]);
  }, [selectedOption]);

  const getFuturesGraph = async () => {
    const getFutures = `fando/getDistribution?exchangeSymbol=${sanitizedValue || "NIFTY 50"
      }&type=${active}`;
    try {
      const response = await apiConfigNewsFlash(`${getFutures}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      response.forEach((data)=>{
        
           if(data.openInterestC === 0){
            setActive('1m')
            setSelectedOption( Object.keys(monthDataOptions)?.[0])
           }
      })
      setFuturesGraph(response);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
      setFuturesGraph([]);
      console.error(error);
    }
  };

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);
    setActive(monthDataOptions[selectedValue][0]);
  };

  const monthData = monthDataOptions[selectedOption] || [];

  const extractData = (key) => futuresGraph?.map((data) => data[key]);

  const strikePrice = useMemo(() => extractData("strikePrice"), [futuresGraph]);
  const changeOIC = useMemo(() => extractData("changeOIC"), [futuresGraph]);
  const changeOIP = useMemo(() => extractData("changeOIP"), [futuresGraph]);
  const openInterestC = useMemo(
    () => extractData("openInterestC"),
    [futuresGraph]
  );
  const openInterestP = useMemo(
    () => extractData("openInterestP"),
    [futuresGraph]
  );

  return (
    <div className="graph-item graph-item2">
      <span className="graph-text">{title}</span>
      <div className="graph-month-container">
        <div className="graph-month">
          {monthData.map((resp, index) => (
            <button
              className={`graph-month-btn ${active === resp && "graph-month-active"
                }`}
              key={index}
              onClick={() => setActive(resp)}
            >
              {resp}
            </button>
          ))}
        </div>
        <div className="graph-month-text">
          <select
            className="graph-month-options"
            value={selectedOption}
            onChange={handleSelectChange}
          >
            {Object.keys(monthDataOptions).map((resp, index) => (
              <option key={index} value={resp}>
                {resp}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="line-graph">
        <ColumnChart
          strikePrice={strikePrice}
          openInterestP={openInterestP}
          openInterestC={openInterestC}
          changeOIP={changeOIP}
          changeOIC={changeOIC}
          title={title}
        />
      </div>
    </div>
  );
};









export const CustomTable = ({
  header,
  data,
  color,
  height,
  isvisible,
  openDialog,
  openInNewTab,
  deleteRow,
  value,
  openIn,
  barGraphDialog
}) => {
  const [sortOrderAll, setSortOrderAll] = useState("asc");
  const [sortColumnAll, setSortColumnAll] = useState("");
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  

  const handleSortAll = (field) => {

    console.log('field', field)
    if (sortColumnAll === field) {
      setSortOrderAll(sortOrderAll === "asc" ? "desc" : "asc");
    } else {
      setSortColumnAll(field);
      setSortOrderAll("asc");
    }
  };

  const calculateValue = (row, column) => {
   
   
    const oneCrore = 10000000;
    const million = 1000000;
  
    if (column === "marketCap(Cr)") {
      return (row?.marketCap || 0) / oneCrore;
    }
  
    if (column === "chngMktCap(Cr)") {
      return ((row?.marketCap || 0) - (row?.prevMarketCap || 0)) / oneCrore;
    }
  
    if (column === "dayHigh") {
      return (row?.dayHigh || 0) * (row?.shareOutstanding || 0);
    }
    if (column === "dayLow") {
      return (row?.dayLow || 0) * (row?.shareOutstanding || 0);
    }
  
    if (column === "dayOpen") {
      return (row?.dayOpen || 0) * (row?.shareOutstanding || 0);
    }
  
    if (column === "accVolume" || column === "avg30Volume") {
      return (row[column] || 0) / million; // Convert to millions
    }


    if (column === "Fall_From_High(%)") {
      return (((row?.lastPrice - row?.dayHigh)/row?.dayHigh) *100); 
    }
    if (column === "Fall_From_High") {
      return (row?.lastPrice - row?.dayHigh); 
    }
    if (column === "Gain_From_Low(%)") {
      return (((row.lastPrice - row.dayLow)/row.dayLow) *100); 
    }

    if (column === "Gain_From_Low") {
      return (row.lastPrice - row.dayLow); 
    }

    if (column === "Fall From high52Week") {
      return (((row.lastPrice - row.high52Week)/row.high52Week) *100); 
    }
    if (column === "Gain From low52Week") {
      return (((row.lastPrice - row.low52Week)/row.low52Week) *100); 
    }
    if (column === "Turnover (Rs Cr)") {
      return ((row.indicesTurnover)/10000000); 
    }
  
  
  
    return 0;
  };
 
 
const sortedData = data?.slice().sort((a, b) => {
  let valueA, valueB;
  
  // Calculate the values for the respective columns
  if (sortColumnAll === "marketCap(Cr)") {
    valueA = calculateValue(a, "marketCap(Cr)");
    valueB = calculateValue(b, "marketCap(Cr)");

  } else if (sortColumnAll === "chngMktCap(Cr)") {
    valueA = calculateValue(a, "chngMktCap(Cr)");
    valueB = calculateValue(b, "chngMktCap(Cr)");
  } 
  
  else if (sortColumnAll === "Fall_From_High(%)"){
    valueA = calculateValue(a, "Fall_From_High(%)");
    valueB = calculateValue(b, "Fall_From_High(%)");
  }

  else if (sortColumnAll === "Fall_From_High"){
    valueA = calculateValue(a, "Fall_From_High");
    valueB = calculateValue(b, "Fall_From_High");
  }

  else if (sortColumnAll === "Gain_From_Low(%)"){
    valueA = calculateValue(a, "Gain_From_Low(%)");
    valueB = calculateValue(b, "Gain_From_Low(%)");
  }
  
  else if (sortColumnAll === "Gain_From_Low"){
    valueA = calculateValue(a, "Gain_From_Low");
    valueB = calculateValue(b, "Gain_From_Low");
  }
  else if (sortColumnAll === "Fall From high52Week"){
    valueA = calculateValue(a, "Fall From high52Week");
    valueB = calculateValue(b, "Fall From high52Week");
  }
  else if (sortColumnAll === "Gain From low52Week"){
    valueA = calculateValue(a, "Gain From low52Week");
    valueB = calculateValue(b, "Gain From low52Week");
  }
  else if (sortColumnAll === "Turnover (Rs Cr)"){
    valueA = calculateValue(a, "Turnover (Rs Cr)");
    valueB = calculateValue(b, "Turnover (Rs Cr)");
  }
  
  
  else {
    valueA = a[sortColumnAll];
    valueB = b[sortColumnAll];
  }

  // Handle potential NaN values
  if (isNaN(valueA)) valueA = 0;
  if (isNaN(valueB)) valueB = 0;

  

  return sortOrderAll === "asc" ? valueA - valueB : valueB - valueA;
});





const renderCellContent = (item, row, value) => {

 
  // Function to format numbers
  const NumberFormatter = (num) => {
    // Ensure num is a number and format it with commas and two decimal places
    return parseFloat(num).toFixed(2).toLocaleString('en-IN');
  };

  // Handle percentage change
  if (item.label === 'percentChange') {
    return `${value}%`;

  // Handle 52-week high and low with .toFixed(2)
  } else if (item.label === 'high52Week') {
    const displayValue = row.dayHigh > row.high52Week ? row.dayHigh : row.high52Week;
    return `${NumberFormatter(displayValue)}`;

  } else if (item.label === 'low52Week') {
    const displayValue = row.dayLow < row.low52Week ? row.dayLow : row.low52Week;
    return `${NumberFormatter(displayValue)}`;

  
  }else if (item.label === 'Fall_From_High(%)') {
    const displayValue = (((row.lastPrice - row.dayHigh)/row.dayHigh) *100);
    return `${NumberFormatter(displayValue)}`;

  }
  else if (item.label === 'Fall_From_High') {
    const displayValue = (row.lastPrice - row.dayHigh);
    return `${NumberFormatter(displayValue)}`;

  }
  else if (item.label === 'Gain_From_Low(%)') {
    const displayValue = (((row.lastPrice - row.dayLow)/row.dayLow) *100);
    return `${NumberFormatter(displayValue)}`;

  }
  else if (item.label === 'Gain_From_Low') {
    const displayValue = (row.lastPrice - row.dayLow);
    return `${NumberFormatter(displayValue)}`;

  }

  else if (item.label === 'Fall From high52Week') {
    const displayValue = (((row.lastPrice - row.high52Week)/row.high52Week) *100);
    return `${NumberFormatter(displayValue)}`;

  }
  else if (item.label === 'Gain From low52Week') {
    const displayValue = (((row.lastPrice - row.low52Week)/row.low52Week) *100);
    return `${NumberFormatter(displayValue)}`;

  }
  //NEW
  else if (item.label === 'High(%)') {
    const displayValue = (((row.dayHigh-row.prevClose) / row.prevClose)*100) ;
    return `${NumberFormatter(displayValue)}`;

  }
  else if (item.label === 'Low(%)') {
    const displayValue = (((row.dayLow-row.prevClose) / row.prevClose)*100) ;
    return `${NumberFormatter(displayValue)}`;

  }
  else if (item.label === 'Open(%)') {
    const displayValue = (((row.dayOpen-row.prevClose) / row.prevClose)*100) ;
    return `${NumberFormatter(displayValue)}`;
  }
  else if (item.label === 'Turnover (Rs Cr)') {
    const displayValue = ((row.indicesTurnover)/10000000) ;
    return `${NumberFormatter(displayValue)}`;

  }

  // Handle 'name' with additional logic for icons
  else if (item.label === 'name' && [1, 2].includes(row.exchangeId)) {
    const icons = {
      'News Flash': { icon: <InfoIcon fontSize="inherit" />, url: 'news' },
      'Announcements': { icon: <AnnouncementIcon fontSize="inherit" />, url: 'announcements' },
      'Alerts': { icon: <ReportProblemIcon fontSize="inherit" />, url: 'alerts' }
    };

    return (
      <>
        {[1].includes(row.instrumentId) && (
          <Tooltip title="watch stocks" placement="top" key="watch-stocks">
            <IconButton
              aria-label="view"
              size="small"
              sx={{ color: '#C54ED8' }}
              onClick={(event) => {
                event.stopPropagation();
                openDialog(row.exchangeSymbol, row.exchangeId);
              }}
            >
              <AddCircleIcon />
            </IconButton>
          </Tooltip>
        )}
        {value}
        {['News Flash', 'Announcements', 'Alerts'].map((iconLabel, index) => (
          <Tooltip title={iconLabel} placement="top" key={index}>
            <IconButton
              aria-label="view"
              size="small"
              sx={{ color: index < 2 ? '#B47EDE' : '#EE4209' }}
              onClick={(event) => {
                event.stopPropagation();
                openInNewTab(`${icons[iconLabel].url}/${row?.exchangeSymbol}`);
              }}
            >
              {icons[iconLabel]?.icon}
            </IconButton>
          </Tooltip>
        ))}
      </>
    );

  // Handle columns with specific calculations
  } else if (['marketCap(Cr)', 'chngMktCap(Cr)', 'accVolume', 'avg30Volume'].includes(item.label)) {
    const calculatedValue = calculateValue(row, item.label);
    return `${NumberFormatter(calculatedValue)}`;

  // Default case
  } else {
    return value;
  }
};



const calculateTotal = (data, key) => {
  if (!Array.isArray(data)) return 0;
  return data.reduce((total, row) => {
    const value = calculateValue(row, key);
    return total + (Number(value) || 0); 
  }, 0);
};

  


  const totalMarketCap = calculateTotal(sortedData, "marketCap(Cr)");

  const totalChngMktCap = calculateTotal(sortedData, "chngMktCap(Cr)");

  const totalDayhigh = calculateTotal(sortedData, "dayHigh");
  
  const totalDaylow = calculateTotal(sortedData, "dayLow");
 

  const totalDayopen = calculateTotal(sortedData, "dayOpen");
  const totalVolume = calculateTotal(sortedData, "accVolume");


 
  const total30DayVolume = calculateTotal(sortedData, "avg30Volume");
  

  const circularProgress = () => {
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: height,
      }}
    >
      <CircularProgress disableShrink />
    </Box>;
  };

  const iconVisibles = (Number.isInteger(value) && value >= 0)

  return (
    <>
      {loading ? (
        circularProgress()
      ) : (

        <>

<TableContainer
  component={Paper}
  className="table-main-container"
  sx={{
    height: height, // Dynamic height
    overflow: "auto", // Enable horizontal and vertical scrolling
  }}
>
  <Table stickyHeader size="small">
    {/* Table Head */}
    <TableHead>
      <TableRow>
        {header?.map((item, index) => (
          <TableCell
            key={index}
            style={{
              backgroundColor: color,
              color: "#fff",
              fontFamily: "Times New Roman', Times, serif",
              fontWeight: "bold",
              position: "sticky", // Sticky for both horizontal and vertical scroll
              top: 0, // Pin to top for vertical scroll
              left: item.label === "name" ? 0 : "auto", // Pin the name column for horizontal scroll
              zIndex: item.label === "name" ? 4 : 3, // Ensure the header stays above body content
              maxWidth: item.label === "name" ? 220 : "auto", // Reduced width for the name column
              minWidth: item.label === "name" ? 220 : "auto", // Set minimum width for consistency
              overflow: "hidden", // Ensure content does not exceed the cell
              textOverflow: "ellipsis", // Add ellipsis for overflow text
              whiteSpace: "nowrap", // Prevent wrapping text
            }}
            onClick={(event) => {
              event.stopPropagation();
              handleSortAll(item.label); // Existing sorting functionality
            }}
          >
            {item.label === "prevClose"
              ? "CLOSE"
              : item.label === "dayOpen"
              ? "OPEN"
              : item.label === "indicative_close"
              ? "INDICATIVE_CLOSE"
              : item.label === "dayHigh"
              ? "HIGH"
              : item.label === "dayLow"
              ? "LOW"
              : item.label === "avg30Volume"
              ? "AVG30VOL(M)"
              : item.label === "percentChange"
              ? "%CHANGE"
              : item.label === "accVolume"
              ? "VOLUME(M)"
              : item.label === "high52Week"
              ? "52WKHG"
              : item.label === "low52Week"
              ? "52WKLW"
              : item.label === "Fall_From_High(%)"
              ? "FALL_FROM_HIGH(%)"
              : item.label === "Gain_From_Low(%)"
              ? "GAIN_FROM_LOW(%)"
              : item.label === "Fall From high52Week"
              ? "FALL_FROM_HIGH52WEEK(%)"
              : item.label === "Gain From low52Week"
              ? "GAIN_FROM_LOW52WEEK(%)"
              : item.label?.toUpperCase()}
            {sortColumnAll === item.label && (
              <span style={{ marginLeft: "4px" }}>
                {sortOrderAll === "asc" ? "↑" : "↓"}
              </span>
            )}
            {((!isvisible || iconVisibles) && item.label === "name") && (
              <BarChartIcon
                size="small"
                className="blinking"
                onClick={(event) => {
                  event.stopPropagation();
                  barGraphDialog(sortedData, iconVisibles); // Existing bar graph dialog functionality
                }}
              />
            )}
          </TableCell>
        ))}
        {iconVisibles && (
          <TableCell
            style={{
              backgroundColor: color,
              color: "black",
              fontWeight: "bold",
              position: "sticky",
              top: 0,
              zIndex: 3,
            }}
          >
            {"REMOVE"}
          </TableCell>
        )}
      </TableRow>
    </TableHead>

    {/* Table Body */}
    <TableBody>
      {sortedData?.map((row, rowIndex) => (
        <TableRow
          key={rowIndex}
          onClick={() =>
            openIn &&
            openInNewTab(
              `/${row.exchangeSymbol}/${row.exchangeId}/${row.lastPrice}/${row.prevClose}`
            )
          }
        >
          {header.map((item, cellIndex) => (
            <TableCell
              key={cellIndex}
              className="dynamic-cell"
              style={{
                fontWeight: "900",
                fontSize: "medium",
                color:
                  row && row.change < 0
                    ? "#F54040"
                    : row.change === 0
                    ? "#0000FF"
                    : "#0F9D22",
                position: item.label === "name" ? "sticky" : "static", // Pin 'name' column
                left: item.label === "name" ? 0 : "auto", // Position sticky column to the left
                backgroundColor: "#FFF", // Prevent overlap background
                zIndex: item.label === "name" ? 1 : "auto", // Proper layer stacking
                maxWidth: item.label === "name" ? 300 : "auto", // Match reduced header width
                minWidth: item.label === "name" ? 300 : "auto", // Match minimum header width
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {renderCellContent(
                item,
                row,
                typeof row[item.label] === "number" &&
                item.label !== "accVolume" &&
                item.label !== "avg30Volume"
                  ? row.name === "India 10-year Bond Yield" ||
                    row.name === "India 10-year Bond Price" ||
                    row.name === "USD-INR"
                    ? row[item.label]?.toFixed(4)
                    : row[item.label]?.toFixed(2)
                  : row[item.label]
              )}
            </TableCell>
          ))}
          {iconVisibles && (
            <TableCell>
              <Tooltip title="Delete" placement="right">
                <DeleteIcon
                  style={{
                    color: "#6082B6",
                    cursor: "pointer",
                    alignItems: "center",
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteRow(row.exchangeSymbol); // Existing delete row functionality
                  }}
                />
              </Tooltip>
            </TableCell>
          )}
        </TableRow>
      ))}
    </TableBody>

    {/* Table Footer */}
    <TableFooter>
      <TableRow>
        <TableCell colSpan={header.length + (iconVisibles ? 1 : 0)}>
          <Typography
            style={{
              fontWeight: "600",
              fontSize: "medium",
              color: "black",
            }}
          >
            SubTotal :- Day Open Market Cap:{" "}
            {(NumberFormatter(totalDayopen) / 10000000).toFixed(2)} | Day High
            Market Cap: {(NumberFormatter(totalDayhigh) / 10000000).toFixed(2)} | Day
            Low Market Cap: {(NumberFormatter(totalDaylow)/10000000).toFixed(2)} | Market Cap:{" "}
            {NumberFormatter(totalMarketCap) + "Cr"} | Change Market Cap:{" "}
            {NumberFormatter(totalChngMktCap) + "Cr"} | Volume:{" "}
            {MillionFormatter(totalVolume)} | 30-Day Volume:{" "}
            {MillionFormatter(total30DayVolume)}
          </Typography>
        </TableCell>
      </TableRow>
    </TableFooter>
  </Table>
</TableContainer>




          
        </>

      )}
    </>
  );
};

export const VisibleColumnsBasicExample = ({
  columns,
  rows,
  buttonLabels,
  density,
  height,
  width,
}) => {
  const [active, setActive] = useState(0);
  const rowsWithIds = rows.map((row, index) => ({ ...row, id: index }));

  return (
    <>
      {buttonLabels && buttonLabels.length > 0 ? (
        <Grid className="table-tabs-container">
          {buttonLabels.map((label, index) => (
            <button
              key={index}
              className={`filter-btn ${active === index && "select-btn"}`}
              onClick={() => setActive(index)}
            >
              {label}
            </button>
          ))}
        </Grid>
      ) : (
        ""
      )}
      <Box
        sx={{
          height: height,
          width: width,
          "& .super-app-theme--cell": {
            backgroundColor: "#F1EED9",
            color: "#1a3e72",
            fontWeight: "600",
          },
          "& .super-Strike-theme--cell": {
            backgroundColor: "#F1EED9",
            color: "red",
            fontWeight: "900",
          },
          "& .super-app-theme--header": {
            backgroundColor: "#3A2D7D",
            color: "#fff",
          },
        }}
      >
        <DataGrid
          columns={columns}
          rows={rowsWithIds}
          density={density}
          slots={{
            toolbar: GridToolbar,
          }}
        />
      </Box>
    </>
  );
};

export const DeliveryTable = ({
  columns,
  rows,
  density,
  height,
  width, }) => {

  const rowsWithIds = rows && rows?.map((row, index) => ({
    ...row,
    id: index,
    totalAccTrnOvr: (row.totalAccTrnOvr / 10000000).toFixed(2),
    totalDelTrnOvr: (row.totalDelTrnOvr / 10000000).toFixed(2),
    deliveryPerc: row.deliveryPerc.toFixed(2),
    x30DAVol: (row.totalAccVol / row.avgVolume).toFixed(2),
    x30DADel: (row.totalDelVol / row.avgDelVolume).toFixed(2),
    marketCapCr :(row.marketCap/10000000).toFixed(2) 
  }));

  return (
    <>
      <Typography>
        <strong>
          <span> DATE : {rowsWithIds?.[0]?.calculatedAt}</span>
        </strong>
      </Typography>
      <Box
        sx={{
          height: height,
          width: width,
          "& .super-app-theme--cell": {
            backgroundColor: "#F1EED9",
            color: "#1a3e72",
            fontWeight: "600",
          },
          "& .super-Strike-theme--cell": {
            backgroundColor: "#F1EED9",
            color: "red",
            fontWeight: "900",
          },
          "& .super-app-theme--header": {
            backgroundColor: "#3A2D7D",
            color: "#fff",
          },
        }}
      >
      <Box
  sx={{
    width: '100%',
    height: '700px', // Adjust as needed
    overflowX: 'auto', // Enables horizontal scrolling
    overflowY: 'hidden', // Optional: hides vertical overflow
  }}
>
  <DataGrid
    columns={columns}
    rows={rowsWithIds}
    density={density}
    slots={{
      toolbar: GridToolbar,
    }}
    
    sx={{
      position: 'sticky', // Ensures headers stay sticky
      top: 80,
      minWidth: '800px', // Ensures grid has a minimum width for horizontal scrolling


      '& .MuiDataGrid-cell[data-field="name"]': {
        position: 'sticky',
        left: 0, // Pin it to the left
        backgroundColor: 'white', // Ensure it doesn't overlap other columns
        zIndex: 2, // Ensure it's above other cells
      },
      
     
    }}
  />
</Box>
       
      </Box>
    </>
  )
};

