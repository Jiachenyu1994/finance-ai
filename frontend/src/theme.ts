import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',  // 苹果标志性的黑色
      light: '#333333',
      dark: '#000000',
    },
    secondary: {
      main: '#86868b',  // 苹果常用的灰色
      light: '#f5f5f7',
      dark: '#1d1d1f',
    },
    background: {
      default: '#ffffff',
      paper: '#fbfbfd',
    },
    text: {
      primary: '#1d1d1f',
      secondary: '#86868b',
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", "SF Pro Icons", "Helvetica Neue", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '96px',
      fontWeight: 700,
      letterSpacing: '-0.015em',
      lineHeight: 1.05,
      marginBottom: '0.5em',
    },
    h2: {
      fontSize: '48px',
      fontWeight: 600,
      letterSpacing: '-0.009em',
      lineHeight: 1.1,
    },
    h3: {
      fontSize: '40px',
      fontWeight: 500,
      letterSpacing: '0.004em',
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '17px',
      lineHeight: 1.47059,
      fontWeight: 400,
      letterSpacing: '-0.022em',
    },
    body2: {
      fontSize: '14px',
      lineHeight: 1.42859,
      fontWeight: 400,
      letterSpacing: '-0.016em',
    },
  },
  components: {
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#000',
          '&.small': {
            width: 20,
            height: 20,
          },
          animation: 'circular-rotate 1.4s ease-in-out infinite',
        },
        circle: {
          strokeLinecap: 'round',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
          height: 4,
        },
        bar: {
          borderRadius: 8,
          backgroundColor: '#000',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 980,  // 苹果风格的大圆角
          padding: '12px 28px',
          fontSize: '17px',
          fontWeight: 400,
          letterSpacing: '-0.022em',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          boxShadow: 'none',
          backgroundColor: '#000',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#333',
            transform: 'scale(1.02)',
          },
        },
        outlined: {
          borderColor: '#86868b',
          '&:hover': {
            borderColor: '#000',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(251, 251, 253, 0.8)',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(251, 251, 253, 0.8)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(251, 251, 253, 0.9)',
            },
            '&.Mui-focused': {
              backgroundColor: '#fff',
              boxShadow: '0 0 0 4px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(251, 251, 253, 0.8)',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
        },
        elevation1: {
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
        },
        elevation3: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});