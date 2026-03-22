"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useUIStore } from "@/stores/uiStore";
import { useAuth } from "@/hooks/useAuth";

/**
 * Organism – Top application bar with sidebar toggle and user menu.
 */
export function TopBar() {
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: "1px solid",
        borderColor: "grey.200",
        backgroundColor: "background.paper",
        color: "text.primary",
      }}
    >
      <Toolbar>
        <IconButton edge="start" onClick={toggleSidebar} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, color: "primary.main" }}>
          DUA Generator
        </Typography>

        <Box className="flex items-center gap-2">
          <Typography variant="body2" color="text.secondary">
            {user?.name}
          </Typography>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.85rem" }}>
            {initials}
          </Avatar>
          <Tooltip title="Sign out">
            <IconButton size="small" onClick={logout}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
