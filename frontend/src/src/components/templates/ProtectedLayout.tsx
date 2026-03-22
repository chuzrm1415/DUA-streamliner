import Box from "@mui/material/Box";
import { TopBar } from "@/components/organisms/TopBar";
import { Sidebar } from "@/components/organisms/Sidebar";

interface ProtectedLayoutTemplateProps {
  children: React.ReactNode;
}

/**
 * Template – Shell for all authenticated pages.
 * Renders TopBar + collapsible Sidebar + main content area.
 */
export function ProtectedLayoutTemplate({ children }: ProtectedLayoutTemplateProps) {
  return (
    <Box className="flex min-h-screen bg-slate-50">
      <TopBar />
      <Sidebar />

      {/* Main content — shifts right when sidebar is open */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: "64px", // AppBar height
          p: { xs: 2, md: 3 },
          minWidth: 0, // prevent overflow
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
