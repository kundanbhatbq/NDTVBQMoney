import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Grid,
} from "@mui/material";
import { DataGrid, GridToolbar, GridOverlay } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { apiConfigCalendar } from "../../commonApi/apiConfig";
import dayjs from "dayjs";

const NoRowsOverlay = () => (
  <GridOverlay>
    <Typography variant="h6" color="textSecondary">
      No Data
    </Typography>
  </GridOverlay>
);

const BoardMeeting = () => {
  const currentDate = dayjs();
  const [token, setToken] = useState(Cookies.get("token") || "");
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [selectedActionType, setSelectedActionType] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const tokenFromCookies = Cookies.get("token");
      if (tokenFromCookies) {
        setToken(tokenFromCookies);
      } else {
        navigate("/");
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (token) {
      getTableData(token);
    }
  }, [token, selectedDate, selectedActionType]);

  const getTableData = async (token) => {
    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD"); // API format
      const response = await apiConfigCalendar(
        `flash/boardMeeting?date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const formattedData = response.map((item, index) => ({
        id: index + 1,
        symbol: item.symbol,
        name: item.name,
        marketCap: item.marketCap,
        purpose: item.purpose,
        actionType: item.actionType,
        lastPrice: item.lastPrice,
        exDate: item.exDate,
      }));

      setData(formattedData);
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

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };



  const columns = [
    { field: "symbol", headerName: "Symbol", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "purpose", headerName: "Purpose", flex: 1 },
   
    {
      field: "lastPrice",
      headerName: "Last Price",
      flex: 1,
      type: "number",
      cellClassName: (params) => {
        if (params.value < 0) {
          return "negative-value";
        } else if (params.value === 0) {
          return "neutral-value";
        } else {
          return "positive-value";
        }
      },
    },
    {
      field: "exDate",
      headerName: "Date of board meeting",
      flex: 1,
      type: "date",
      valueFormatter: (params) => dayjs(params.value).format("DD-MMM-YYYY"),
    },
    {
      field: "marketCap",
      headerName: "Market Cap",
      flex: 1,
      type: "number",
      valueFormatter: (params) => `${(params.value / 1e7).toFixed(2)} Cr`,
      cellClassName: (params) => {
        if (params.value < 0) {
          return "negative-value";
        } else if (params.value === 0) {
          return "neutral-value";
        } else {
          return "positive-value";
        }
      },
    },
  ];

  const formatDateDisplay = (date) => {
    return date ? date.format("DD-MM-YYYY") : "";
  };

  return (
    <Box sx={{ flexGrow: 1, textAlign: "center" }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item>
       
        </Grid>
        <Grid item>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select Date"
              value={selectedDate} // Pass dayjs object
              format="DD/MM/YYYY"
              onChange={handleDateChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ width: 200 }}
                  InputProps={{
                    ...params.InputProps,
                    // Manually set the display value to dd-mm-yyyy
                    value: formatDateDisplay(selectedDate)
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>

      <Box mt={3}>
        <div style={{ height: "100%", width: "100%" }}>
          <DataGrid
            rows={data}
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
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: "#3f51b5",
                color: "#fff",
              },
              "& .MuiDataGrid-cell": {
                backgroundColor: "#f9f9f9",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: "#f1f1f1",
              },
              "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                outline: "none !important",
              },
            }}
          />
        </div>
      </Box>
    </Box>
  );
};

export default BoardMeeting;
