import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#58a6ff',
      light: '#79b8ff',
      dark: '#1f6feb',
    },
    secondary: {
      main: '#a371f7',
      light: '#bc8cff',
      dark: '#8957e5',
    },
    success: {
      main: '#3fb950',
      light: '#56d364',
      dark: '#238636',
    },
    warning: {
      main: '#d29922',
      light: '#e3b341',
      dark: '#9e6a03',
    },
    error: {
      main: '#f85149',
      light: '#ff7b72',
      dark: '#da3633',
    },
    info: {
      main: '#58a6ff',
    },
    background: {
      default: '#0d1117',
      paper: '#161b22',
    },
    text: {
      primary: '#e6edf3',
      secondary: '#8b949e',
    },
    divider: '#30363d',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.95rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#8b949e',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #30363d',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #30363d',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#30363d',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#161b22',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#1c2128 !important',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          borderRight: '1px solid #30363d',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: '#1f6feb',
            '&:hover': {
              backgroundColor: '#388bfd',
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#58a6ff',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
