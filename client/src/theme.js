import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#284f43',
      light: '#4c7561',
      dark: '#1d3d33',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e56b42',
      light: '#ee9270',
      dark: '#c5512e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f3f6f1',
      paper: '#ffffff',
    },
    success: { main: '#3d8057' },
    warning: { main: '#a56c23' },
    error: { main: '#b54735' },
    info: { main: '#54798a' },
    divider: '#dfe7df',
    text: {
      primary: '#22312b',
      secondary: '#5f7067',
      disabled: '#87938b',
    },
  },
  typography: {
    fontFamily: "'DM Sans', sans-serif",
    h1: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.15 },
    h2: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
    h3: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.25 },
    h4: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 },
    h5: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.35 },
    h6: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: '0.95rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.55 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: 0 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#f3f6f1', color: '#22312b' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 5,
          padding: '8px 16px',
          fontSize: '0.875rem',
          letterSpacing: 0,
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 3px 10px rgba(40,79,67,0.16)' },
        },
        containedPrimary: {
          backgroundColor: '#284f43',
          '&:hover': { backgroundColor: '#1d3d33' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(34,49,43,0.06)',
          border: '1px solid #e5ebe5',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 20,
          '&:last-child': { paddingBottom: 20 },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 5 } },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 4, fontWeight: 700, fontSize: '0.75rem' } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#edf3ed',
            color: '#385749',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            borderBottom: '1px solid #dfe7df',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: '12px 16px', borderColor: '#e8ede8', color: '#34443b', fontSize: '0.875rem' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': { backgroundColor: '#fbfcf9' },
          '&:hover': { backgroundColor: '#f0f5ef' },
          transition: 'background-color 0.15s',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#284f43',
          color: '#fff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#fbfcf9',
          color: '#22312b',
          boxShadow: 'none',
          borderBottom: '1px solid #e2e9e2',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { border: '1px solid #e5ebe5', boxShadow: '0 16px 48px rgba(34,49,43,0.16)' } },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: { borderRadius: '5px !important', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: 'none' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd7cd' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#85998a' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#284f43', borderWidth: 1.5 },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { color: '#5f7067', '&.Mui-focused': { color: '#284f43' } } },
    },
    MuiMenuItem: {
      styleOverrides: { root: { minHeight: 40, '&.Mui-selected': { backgroundColor: '#edf3ed' } } },
    },
    MuiToolbar: {
      styleOverrides: { root: { minHeight: '68px !important', '@media (max-width:600px)': { minHeight: '60px !important' } } },
      },
  },
});

export default theme;
