import React, { useState } from "react";
import { Container, Typography, TextField, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = ({ handleUserLogin }) => {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  };

  const paperStyle = {
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const inputStyle = {
    width: "100%",
    marginBottom: "16px",
    
  };

  const buttonStyle = {
    width: "100%",
    marginTop: "16px",
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const isEmailValid = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    handleUserLogin(
      email,
      setEmail,
      password,
      navigate,
      setError,
      isEmailValid
    );
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogin();
    }
  };

  return (
    <Container style={containerStyle}>
      <Paper style={paperStyle}>
      <img
          src="../../images/logo.png"
          alt="NDTVMONEY"
          style={{ width: "150px", marginBottom: "5px" }}
        />
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <p style={{ color: "red", marginBottom: "10px", fontWeight: "bold" }}>
          {error}
        </p>
        <form>
          <TextField
            label="Email *"
            type="Email"
            fullWidth
            variant="outlined"
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
           
          />
          <TextField
            label="Password *"
            type="password"
            fullWidth
            variant="outlined"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            
          />
          <Button
            variant="contained"
            color="primary"
            style={buttonStyle}
            onClick={handleLogin}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
