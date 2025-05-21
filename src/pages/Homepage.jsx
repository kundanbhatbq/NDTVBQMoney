import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { apiConfigPost } from "../commonApi/apiConfig";
import Login from "../components/login/login";
import Interested from "../components/Interested";
import Chart from "../components/Chart";
import Fno from "../components/Fno/fno";
import News from "../components/NewsFlash/news";
import Announcement from "../components/Announcement/announcement";
import Delivery from "../components/Delivery/delivery";
import Alerts from "../components/Alert/alert";
import Contribution from "../components/contribution/contribution";
import Sectorial from "../components/sectorial/sectorial";
import AdvanceDecline from "../components/AdvancedDecline/advanceDecline";
import GanerLoser from "../components/sectoralGanerLoser/ganerLoser";
import MostFunction from "../components/mostFunction/mostFunction";
import IPO from "../components/Ipo/IPO";
import Calendar from "../components/Calendar/tabs";
import MonthlyReturn from "../components/MonthlyReturn/MonthlyReturn"
import MarketCap from "../components/MarketCap/marketCap";
import HLC from "../components/HLC/HLC";
import FIIDII from "../components/FIIDII/FIIDII";

const Homepage = () => (
  <section className="home">
    <Pages />
  </section>
);

const Pages = () => {
  const [token, setToken] = useState(() => Cookies.get("token") || "");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  const handleUserLogin = async (email, setEmail, password, navigate, setError, isEmailValid) => {
    if (!isEmailValid(email) || !password) {
      setError(!isEmailValid(email) ? "Please Enter Email." : "Please Enter Password.");
      return;
    }

    try {
      const data = await apiConfigPost(`auth/generateToken`, { username: email, password });
      setToken(data);
      Cookies.set("token", data, { expires: 7 });
      Cookies.set("email", email, { expires: 7 });
      navigate("/interested");
    } catch {
      setError("Please enter a valid Email and Password.");
      Cookies.remove("token");
      Cookies.remove("email");
      setEmail("");
      navigate("/");
    }
  };

  const authRoute = (path, Component) => (
    <Route path={path} element={token ? <Component /> : <Login handleUserLogin={handleUserLogin} />} />
  );

  return (
    <Routes>
      <Route path="/" element={<Login handleUserLogin={handleUserLogin} />} />
      {authRoute("/interested", Interested)}
      {authRoute("/FIIDII",FIIDII)}
      {authRoute("/delivery", Delivery)}
      {authRoute("/fno", Fno)}
      {authRoute("/news/:id", News)}
      {authRoute("/news", News)}
      {authRoute("/alerts/:id", Alerts)}
      {authRoute("/alerts", Alerts)}
      {authRoute("/contribution", Contribution)}
      {authRoute("/advanced", AdvanceDecline)}
      {authRoute("/sectorial", Sectorial)}
      {authRoute("/sectoralgraph", GanerLoser)}
      {authRoute("/announcements/:id", Announcement)}
      {authRoute("/announcements", Announcement)}
      {authRoute("/:name/:id/:price/:prevClose", Chart)}
      {authRoute("/mostfunction", MostFunction)}
      {authRoute("/ipo", IPO)}
      {authRoute("/tabs", Calendar )}
      {authRoute("/monthlyretrun",MonthlyReturn  )}
      {authRoute("/marketCap",MarketCap )}
      {authRoute("/HLC",HLC )}
      


      
    </Routes>
  );
};

export default Homepage;
