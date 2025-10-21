import React from "react";
import { useNavigate, Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard";
import api from './api';

// 1. 导入 React，所有 React 组件都需要

function MainPage() {
  // 2. 定义主组件 App
  const [showRegister, setShowRegister] = React.useState(true);
  const [showLogin, setShowLogin] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [identifier, setIdentifier] = React.useState("");
  const navigate = useNavigate();
  const handleRegisterClick = () => {
    setShowLogin(false);
    setShowRegister(!showRegister);
  };
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }
    try {
      const response = await api.post('/api/register_user', {
        username,
        email,
        name,
        password,
      });
      console.log("注册成功:", response.data);
      alert("Registration successful!");
      
    } catch (error) {
      console.error("注册失败:", error);
      alert("Registration failed. Please try again.");
    }
  };
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/login', {
        identifier,
        password,
      });
      console.log("登录成功:", response.data);
      alert("Login successful!");
      const token = response.data.token;
      localStorage.setItem("authToken", token);
      navigate('/dashboard');
    } catch (error) {
      console.error("登录失败:", error);
      alert("Login failed. Please try again.");
    }
  };
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>欢迎使用 Finance AI</h1>
      <div style={{ marginTop: "40px" }}>
        <button style={{ marginRight: "20px", padding: "10px 30px" }} onClick={handleRegisterClick}>
          Register
        </button>
        <button style={{ padding: "10px 30px" }} onClick={()=>{setShowLogin(!showLogin); setShowRegister(false)}}>
          Login
        </button>
        {showLogin && <div><form onSubmit={handleLoginSubmit} style={{ display: "inline-block", textAlign: "left" ,border: "1px solid #ccc", padding: "20px", borderRadius: "5px"}}>
          <div>
            <label>Username or Email: </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Please enter your username or email"
              required
            />
          </div>
          <div>
            <label>Password: </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="**************"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <button type="submit">Login</button>
            <button type="button" style={{ marginLeft: "10px" }} onClick={() => setShowLogin(!showLogin)}>Close</button>
          </div>
        </form></div>}



        {showRegister && 
        <div style={{ marginTop: "20px" }}>
          <form onSubmit={handleRegisterSubmit} style={{ display: "inline-block", textAlign: "left" ,border: "1px solid #ccc", padding: "20px", borderRadius: "5px"}}>
            <div>
              <label>Username: </label>
              <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Please enter your username"
              required
              />
            </div>
            <div>
              <label>Email: </label>
              <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Please enter your email"
              required
              />
            </div>
            <div>
              <label>Name: </label>
              <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Please enter your name"
              required
              />
            </div>
            <div>
              <label>Password: </label>
              <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="**************"
              onChange={(e) => setPassword(e.target.value)}
              required
              />
              <button
              type="button" 
              onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div>
              <label>Confirm Password: </label>
              <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              placeholder="**************"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              />
              <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div style={{ textAlign: "center", marginTop: "10px" }}>
            <button type="submit">Register</button>
            <button type="button" style={{ marginLeft: "10px" }} onClick={handleRegisterClick}>Close</button>
            </div>
          </form>
        </div>}
      </div>
    </div>
  );
}



function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;