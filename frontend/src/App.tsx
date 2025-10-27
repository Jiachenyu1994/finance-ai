import React from "react";
import axios from "axios";
import { useNavigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Dashboard from "./dashboard";
import { API_BASE_URL } from './config';
import { theme } from './theme';

// 1. 导入 React，所有 React 组件都需要

function MainPage() {
  const [showRegister, setShowRegister] = React.useState(true);
  const [showLogin, setShowLogin] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [identifier, setIdentifier] = React.useState("");
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");
  const [alertSeverity, setAlertSeverity] = React.useState<'success' | 'error'>('success');
  const navigate = useNavigate();
  const handleAlert = (message: string, severity: 'success' | 'error') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleRegisterClick = () => {
    setShowLogin(false);
    setShowRegister(!showRegister);
  };
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      handleAlert("Passwords do not match!", "error");
      return;
    }
    if (password.length < 8) {
      handleAlert("Password must be at least 8 characters long!", "error");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/register_user`, {
        username,
        email,
        name,
        password,
      });
      handleAlert("Registration successful!", "success");
      setShowRegister(false);
      setShowLogin(true);
    } catch (error) {
      console.error("注册失败:", error);
      handleAlert("Registration failed. Please try again.", "error");
    }
  };
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        identifier,
        password,
      });
      handleAlert("Login successful!", "success");
      const token = response.data.token;
      localStorage.setItem("authToken", token);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000); // 延迟1秒跳转，让用户看到成功提示
    } catch (error) {
      console.error("登录失败:", error);
      handleAlert("Login failed. Please try again.", "error");
    }
  };
  return (
    <Container maxWidth="sm">
      <Box 
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Finance AI
          </Typography>
        </motion.div>
        
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRegisterClick}
            sx={{ minWidth: 120 }}
          >
            Register
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {setShowLogin(!showLogin); setShowRegister(false)}}
            sx={{ minWidth: 120 }}
          >
            Login
          </Button>
        </Box>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Paper 
              elevation={3}
              sx={{ 
                mt: 4, 
                p: 4, 
                width: '100%',
                maxWidth: 400
              }}
            >
              <Typography variant="h5" component="h2" gutterBottom>
                Login
              </Typography>
              <Box 
                component="form" 
                onSubmit={handleLoginSubmit}
                sx={{ mt: 2 }}
              >
                <TextField
                  fullWidth
                  label="Username or Email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Login
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowLogin(false)}
                    fullWidth
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}



        {showRegister && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Paper 
              elevation={3}
              sx={{ 
                mt: 4, 
                p: 4,
                width: '100%',
                maxWidth: 400
              }}
            >
              <Typography variant="h5" component="h2" gutterBottom>
                Register
              </Typography>
              <Box 
                component="form" 
                onSubmit={handleRegisterSubmit}
                sx={{ mt: 2 }}
              >
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Register
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleRegisterClick}
                    fullWidth
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}
        <Snackbar 
          open={alertOpen} 
          autoHideDuration={6000} 
          onClose={() => setAlertOpen(false)}
        >
          <Alert 
            onClose={() => setAlertOpen(false)} 
            severity={alertSeverity}
            sx={{ width: '100%' }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}



function App() {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;