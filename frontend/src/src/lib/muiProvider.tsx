"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { theme } from "@/config/theme";

interface MUIProviderProps {
  children: React.ReactNode;
}

export function MUIProvider({ children }: MUIProviderProps) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
