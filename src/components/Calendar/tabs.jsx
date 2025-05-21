import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BoardMeeting from './BoardMeeting';
import CooperateActions from './CooperateActions';
import EarningsEstimate from './EarningsEstimate';
import EarningsGuest from './EarningsGuest';
import { AppBar, Grid, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from "@mui/icons-material/Home";

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography component="div">{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Calendar = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
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
                <span>Calendar</span>
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

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          backgroundColor: "aliceblue",
          marginTop: "60px",
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          sx={{
            "& .MuiTab-root": {
              fontWeight: "bold",
              fontSize: "1rem",
              borderRadius: 2,
              color: "red",
              "&.Mui-selected": {
                color: "primary.main",
                borderBottom: `2px solid primary.main`,
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "primary.main",
              height: 4,
            },
          }}
        >
          <Tab label="Corporate Action" {...a11yProps(0)} />
          <Tab label=" Board meeting" {...a11yProps(1)} />
          <Tab label="Earnings Estimate" {...a11yProps(2)} />
          <Tab label="Earnings Guest" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0}>
      <CooperateActions />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
      <BoardMeeting />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <EarningsEstimate />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <EarningsGuest />
      </CustomTabPanel>
    </Box>
  );
};

export default Calendar;
