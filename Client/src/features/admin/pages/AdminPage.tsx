import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Container from "@mui/material/Container";
import Tooltip from "@mui/material/Tooltip";
import MenuIcon from "@mui/icons-material/Menu";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PeopleIcon from "@mui/icons-material/People";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../../stores/hooks";
import { logout } from "../../../stores/authSlice";
import { useLogoutMutation } from "../../../stores/authApi";
import { baseApi } from "../../../stores/baseApi";
import { useThemeMode } from "../../../providers/ThemeProvider";
import { GRADIENT, GRADIENT_DARK } from "../../../config/constants";
import { AdminNotificationBell } from "../components/AdminNotificationBell";

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactElement;
  end: boolean;
  external?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/admin", icon: <DashboardIcon />, end: true },
  {
    label: "Products",
    path: "/admin/products",
    icon: <Inventory2Icon />,
    end: false,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: <ShoppingBagIcon />,
    end: false,
  },
  { label: "Users", path: "/admin/users", icon: <PeopleIcon />, end: false },
  { label: "Logs", path: "/admin/logs", icon: <ReceiptLongIcon />, end: false },
  { label: "Health", path: "/admin/health-checks", icon: <HealthAndSafetyIcon />, end: false },
  { label: "Background Jobs", path: "/hangfire", icon: <WorkHistoryIcon />, end: false, external: true },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { mode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          component="img"
          src="/favicon.jpg"
          alt="VMart"
          sx={{ width: 30, height: 30, borderRadius: 1 }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            background: mode === "dark" ? GRADIENT_DARK : GRADIENT,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px",
          }}
        >
          VMart
        </Typography>
      </Box>
      <List sx={{ flex: 1, px: 1, pt: 1 }}>
        {navItems.map((item) => {
          const active = !item.external && (item.end
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  if (item.external) {
                    window.open(item.path, "_blank", "noopener,noreferrer");
                  } else {
                    navigate(item.path);
                  }
                  onNavigate?.();
                }}
                selected={active}
                sx={{
                  borderRadius: 2,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": { bgcolor: "primary.dark" },
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: { sx: { fontWeight: 500, fontSize: "0.9rem" } },
                  }}
                />
                {item.external && <OpenInNewIcon sx={{ fontSize: 16, opacity: 0.7 }} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

export function AdminPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();
  const { mode, toggleMode } = useThemeMode();

  const handleLogout = async () => {
    setAnchorEl(null);
    try {
      await logoutApi().unwrap();
    } catch {}
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    navigate("/");
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {isDesktop && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      )}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            bgcolor: "background.paper",
          },
        }}
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
            color: "text.primary",
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: "none" }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flex: 1, display: { xs: "none", sm: "block" } }}
            >
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>

            <AdminNotificationBell />

            <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
              <IconButton
                onClick={toggleMode}
                sx={{
                  mr: 1,
                  color: "text.secondary",
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "rotate(30deg)" },
                }}
              >
                {mode === "dark" ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Back to site">
              <IconButton
                onClick={() => navigate("/")}
                sx={{ mr: 1, color: "text.secondary" }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={!!anchorEl}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    minWidth: 180,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  },
                },
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Admin
                </Typography>
              </Box>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  navigate("/profile");
                }}
                sx={{ borderRadius: 1, mx: 0.5 }}
              >
                <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{ borderRadius: 1, mx: 0.5 }}
              >
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Sign Out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
