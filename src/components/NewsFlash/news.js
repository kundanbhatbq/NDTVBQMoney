import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Tooltip,
  InputBase,
  Paper,
  IconButton,
  AppBar,
  Box,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import Cookies from "js-cookie";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiConfigNewsFlash } from "../../commonApi/apiConfig";

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  backgroundColor: "#f0f8ff",
};

const contentStyle = {
  padding: "60px 20px 0px 20px",
};

const News = () => {
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsFlash, setNewsFlash] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  let sanitizedValue = id?.replace(/&/g, "%26");

  useEffect(() => {
    const fetchData = async () => {
      const tokenFromCookies = Cookies.get("token");
      if (tokenFromCookies) {
        setToken(tokenFromCookies);
        if (searchQuery?.length === 0) {
          await getNewsFlash();
        }
      } else {
        navigate("/");
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      if (searchQuery?.length >= 3) {
        !sanitizedValue && (await getAllFlash());
        sanitizedValue && (await getStockFlash());
      }
    };
    fetchData();
  }, [searchQuery]);

  const getNewsFlash = async () => {
    const isSymbol = `flash/getFlash?exchangeSymbol=${sanitizedValue}`;
    const allNews = `flash/getFlash`;
    try {
      const response = await apiConfigNewsFlash(
        `${sanitizedValue ? isSymbol : allNews}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewsFlash(response);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
      setNewsFlash([]);
      console.error(error);
    }
  };

  const getAllFlash = async () => {
    const allNews = `flash/getFlash?text=${searchQuery}`;
    try {
      const response = await apiConfigNewsFlash(`${allNews}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewsFlash(response);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
      setNewsFlash([]);
      console.error(error);
    }
  };

  const getStockFlash = async () => {
    const isSymbol = `flash/getFlash?exchangeSymbol=${sanitizedValue}&text=${searchQuery}`;
    try {
      const response = await apiConfigNewsFlash(`${isSymbol}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewsFlash(response);
    } catch (error) {
      if (token === "") {
        Cookies.remove("token");
        Cookies.remove("email");
        navigate("/");
      }
      setNewsFlash([]);
      console.error(error);
    }
  };

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
                      <Box sx={{display:'flex'}}>
                      <span>News</span>{" "}
                      <span style={{ color: "red" }}>Flash</span>
                      </Box>
                  
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
            justifyContent="start"
          >
            <Grid item>
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
                  focused="true"
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
          </Grid>
          <Grid container justifyContent="center">
            {newsFlash?.map((item, index) => {
              const currentTime = new Date();
              const targetTime = new Date(item?.dateTimes);
              const dateObject = new Date(targetTime);
              const formattedTime = dateObject.toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
              });
              const formattedDate = dateObject.toLocaleDateString("en-IN", {
                timeZone: "Asia/Kolkata",
              });
              targetTime.setMinutes(targetTime.getMinutes() + 2);
              const isInRange =
                currentTime >= new Date(item?.dateTimes) &&
                currentTime <= targetTime;
              const formattedTemplateTypes =
                item?.templateTypes?.replace(/_/g, " ") || "-";

              return (
                <Grid
                  container
                  item
                  key={index}
                  style={{
                    backgroundColor: "white",
                    marginBottom: "10px",
                    padding: "5px",
                    borderRadius: "10px",
                    borderLeft: `5px solid ${isInRange ? "green" : "red"}`,
                  }}
                >
                  <Grid item xs={12} sm={6}>
                    <Typography fontWeight="900" color="textPrimary">
                      {`${item.header?.toUpperCase() || "-"} | ${
                        item.headlines?.toUpperCase() || "-"
                      } | ${item.news?.toUpperCase() || "-"}`}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={2} textAlign={"center"}>
                    <Typography fontWeight="900" color="error">
                      {formattedTemplateTypes || "-"}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={2} textAlign={"center"}>
                    <Typography fontWeight="900" color="error">
                      {item.exchangeSymbol?.toUpperCase() || "-"}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={1} textAlign={"center"}>
                    <Typography fontWeight="900" color="primary">
                      {formattedTime || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={1} textAlign={"center"}>
                    <Typography fontWeight="900" color="primary">
                      {formattedDate || "-"}
                    </Typography>
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
        </div>
      </div>
    </>
  );
};

export default News;
