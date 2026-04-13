"use client";

import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/uiStore";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/protected/dashboard",
    icon: <DashboardIcon />,
    permission: null,
  },
  {
    label: "Generate DUA",
    href: "/protected/document-processing",
    icon: <DescriptionIcon />,
    permission: PERMISSIONS.UPLOAD_FILES,
  },
  {
    label: "Users",
    href: "/protected/users",
    icon: <PeopleIcon />,
    permission: PERMISSIONS.MANAGE_USERS,
  },
  {
    label: "Reports",
    href: "/protected/reports",
    icon: <AssessmentIcon />,
    permission: PERMISSIONS.VIEW_REPORTS,
  },
];

/**
 * Organism – Collapsible sidebar navigation.
 * Items are filtered by RBAC permissions.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  const { can } = usePermissions();

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.permission === null || can(item.permission as any)
  );

  return (
    <Drawer
      variant="persistent"
      open={sidebarOpen}
      sx={{
        width: sidebarOpen ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          top: 64, // below AppBar
          height: "calc(100% - 64px)",
          borderRight: "1px solid",
          borderColor: "grey.200",
        },
      }}
    >
      <Box className="flex flex-col h-full">
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="overline" color="text.secondary">
            Navigation
          </Typography>
        </Box>
        <Divider />

        <List dense>
          {visibleItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={isActive}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "white",
                      "& .MuiListItemIcon-root": { color: "white" },
                      "&:hover": { backgroundColor: "primary.dark" },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}
