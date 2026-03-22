"use client";

import { createTheme } from "@mui/material/styles";
import { CONFIDENCE_COLORS } from "@/types";

declare module "@mui/material/styles" {
  interface Palette {
    confidence: {
      high: string;
      medium: string;
      low: string;
    };
  }
  interface PaletteOptions {
    confidence?: {
      high?: string;
      medium?: string;
      low?: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1a3a5c",
      light: "#2c5282",
      dark: "#0f2340",
    },
    secondary: {
      main: "#0ea5e9",
      light: "#38bdf8",
      dark: "#0369a1",
    },
    error: {
      main: "#ef4444",
    },
    warning: {
      main: "#eab308",
    },
    success: {
      main: "#22c55e",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    confidence: CONFIDENCE_COLORS,
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
      },
    },
  },
});
