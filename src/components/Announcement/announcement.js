import * as React from 'react';
import { DataGrid, GridToolbar, GridOverlay } from '@mui/x-data-grid';
import AttachmentIcon from "@mui/icons-material/Attachment";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Link from '@mui/material/Link';
import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { apiConfigNewsFlash } from '../../commonApi/apiConfig';
import { AppBar, Box, Grid, Tooltip, Typography } from '@mui/material';
import HomeIcon from "@mui/icons-material/Home";

const renderBroadcastTime = (params) => {
  const date = new Date(params.value);
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleString('en-GB', options).replace(',', '');
};

const renderAttachment = (params) => {
  const isPdf = params.value?.toLowerCase().endsWith(".pdf");
  const fileType = isPdf ? ".PDF" : ".XML";

  return (
    <Link href={params.value} target="_blank" rel="noopener">
      <Tooltip title={fileType} placement="right">
        {isPdf ? (
          <PictureAsPdfIcon
            style={{
              color: "red",
              cursor: "pointer",
              alignItems: "center",
            }}
          />
        ) : (
          <AttachmentIcon
            style={{
              color: "red",
              cursor: "pointer",
              alignItems: "center",
            }}
          />
        )}
      </Tooltip>
    </Link>
  );
};

const columns = [
  { field: 'name', headerName: 'Name', width: 300 },
  { field: 'exchangeSymbol', headerName: 'Exchange Symbol', width: 150 },
  { field: 'subject', headerName: 'Subject', width: 300 },
  { field: 'details', headerName: 'Details', width: 600 },
  {
    field: 'marketCap', headerName: 'Market Cap', width: 100, type: 'number', valueFormatter: (params) => {
      return `${params.value.toFixed(2)} Cr`;
    }
  },
  {
    field: 'attachment',
    headerName: 'Attachment',
    width: 80,
    renderCell: renderAttachment
  },
  { field: 'broadcastTime', headerName: 'Broadcast Time', width: 120, renderCell: renderBroadcastTime },
];

const NoRowsOverlay = () => (
  <GridOverlay>
    <Typography variant="h6" color="textSecondary">
      No Data
    </Typography>
  </GridOverlay>
);

export default function AnnouncementsTable() {
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  let sanitizedValue = id?.replace(/&/g, "%26");

  const getAnnouncements = useCallback(async () => {
    const isSymbol = `flash/getAnnouncement?exchangeSymbol=${sanitizedValue}`;
    const allNews = `flash/getAnnouncement`;

    try {
      const response = await apiConfigNewsFlash(
        `${sanitizedValue ? isSymbol : allNews}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.map((item, index) => ({
        id: index + 1,
        ...item,
        marketCap: (item.marketCap / 1e7),
      }));
      setRows(data);
    } catch (error) {
      if (!token) {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
      setRows([]);
      console.error(error);
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const tokenFromCookies = Cookies.get("token");
      if (tokenFromCookies) {
        setToken(tokenFromCookies);
        await getAnnouncements();
      } else {
        navigate("/");
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [getAnnouncements, navigate]);

  return (
    <>
      <header>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar color="default" className="app-bar">
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Tooltip title="Go to Home">
                  <Link href="/interested">
                    <img src="../../images/logo.png" alt="NDTVPROFIT" />
                  </Link>
                </Tooltip>
              </Grid>
              <Grid item>
                <Typography variant="h5" className="announcements-title">
                  <strong>
                    <span>Corporate Announcements</span>
                  </strong>
                </Typography>
              </Grid>
              <Grid item>
                <Tooltip title="Go to Home">
                  <Link href="/interested">
                    <HomeIcon />
                  </Link>
                </Tooltip>
              </Grid>
            </Grid>
          </AppBar>
        </Box>
      </header>
      <Grid className="table" style={{ margin: "60px 10px 5px 10px" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          density="compact"
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
      </Grid>
    </>
  );
}


