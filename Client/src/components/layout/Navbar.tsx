import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Container from "@mui/material/Container";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import Person from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { SearchAutocomplete } from "../../components/ui/SearchAutocomplete";
import { useThemeMode } from "../../providers/ThemeProvider";
import { useGetBasketQuery } from "../../stores/basketApi";
import { useGetFavoriteQuery } from "../../stores/favoriteApi";
import { baseApi } from "../../stores/baseApi";
import { useAppSelector, useAppDispatch } from "../../stores/hooks";
import { GRADIENT, GRADIENT_DARK } from "../../config/constants";
import { logout } from "../../stores/authSlice";
import { useLogoutMutation } from "../../stores/authApi";
import { LanguageSelector } from "../LanguageSelector";
import { useTranslation } from "../../lib/i18n";

export function Navbar() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { mode, toggleMode } = useThemeMode();

  const localizedNavLinks = [
    { label: t("catalog"), to: "/products" },
    { label: t("about"), to: "/about" },
    { label: t("contact"), to: "/contact" },
  ];
  const { isAuthenticated, user, isInitialized } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutApi] = useLogoutMutation();
  const onProductsPage = location.pathname === "/products" || location.pathname.startsWith("/products/");

  const { data: basket } = useGetBasketQuery(undefined, {
    skip: !isInitialized || !isAuthenticated,
  });
  const { data: favorite } = useGetFavoriteQuery(undefined, {
    skip: !isInitialized || !isAuthenticated,
  });

  const itemCount = isAuthenticated ? (basket?.items.length ?? 0) : 0;
  const favoriteCount = isAuthenticated ? (favorite?.items.length ?? 0) : 0;

  const handleLogout = async () => {
    setAnchorEl(null);
    try {
      await logoutApi().unwrap();
    } catch {
      /* ignore */
    }
    dispatch(logout());
    // Reset RTK Query cache to clear basket/favorites for the next anonymous session
    dispatch(baseApi.util.resetApiState());
    navigate("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = scrolled
    ? mode === "dark"
      ? "rgba(22,23,29,0.85)"
      : "rgba(255,255,255,0.75)"
    : "transparent";

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: navBg,
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid",
          borderColor: "divider",
          transition: "all 0.3s ease",
          boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: { xs: 0.25, md: 1 } }}>
            {/* Mobile Menu Icon */}
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: "none" }, color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Link to="/" style={{ textDecoration: "none" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mr: { xs: 0, md: 4 },
                }}
              >
                <Box
                  component="img"
                  src="/favicon.jpg"
                  alt="VMart"
                  sx={{
                    width: 28, height: 28, borderRadius: 1,
                boxShadow: mode === 'dark' ? '0 0 0 2px rgba(96,165,250,0.4)' : 'none',
                  }}
                />
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    fontWeight: 800,
                    background: mode === 'dark' ? GRADIENT_DARK : GRADIENT,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.5px",
                  }}
                >
                  VMart
                </Typography>
              </Box>
            </Link>

            {/* Desktop Nav Links */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 0.5,
                mr: 2,
              }}
            >
              {localizedNavLinks.map((link) => (
                <Button
                  key={link.label}
                  component={Link}
                  to={link.to}
                  sx={{
                    color: "text.secondary",
                    textTransform: "none",
                    fontWeight: 500,
                    borderRadius: 2,
                    px: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "text.primary",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            {/* Search (centered) — container always visible to keep layout */}
            <Box
              sx={{
                flex: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
              }}
            >
              {!onProductsPage && (
                <Box sx={{ width: 400, maxWidth: "100%", ml: 4 }}>
                  <SearchAutocomplete
                    compact
                    placeholder={t("searchPlaceholder")}
                    onSearch={(term) => {
                      navigate(`/products?searchTerm=${encodeURIComponent(term)}`);
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Account, favorites and cart stay aligned to the right on mobile */}
            <Box
              sx={{
                ml: { xs: "auto", md: 0 },
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {/* Auth Section */}
              {isAuthenticated ? (
                <>
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ color: "text.primary" }}
                >
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
                      {user?.roles?.join(", ")}
                    </Typography>
                  </Box>
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      navigate("/profile");
                    }}
                    sx={{ borderRadius: 1, mx: 0.5 }}
                  >
                    <Person fontSize="small" sx={{ mr: 1 }} /> {t("profile")}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      navigate("/favorites");
                    }}
                    sx={{ borderRadius: 1, mx: 0.5 }}
                  >
                    <FavoriteIcon
                      fontSize="small"
                      sx={{ mr: 1, color: "#e91e63" }}
                    />{" "}
                    {t("wishlist")}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      navigate("/orders");
                    }}
                    sx={{ borderRadius: 1, mx: 0.5 }}
                  >
                    <ReceiptLongIcon fontSize="small" sx={{ mr: 1 }} /> {t("myOrders")}
                  </MenuItem>
                  {(user?.roles?.includes("Vendor") || user?.roles?.includes("Admin")) && (
                    <MenuItem
                      onClick={() => {
                        setAnchorEl(null);
                        navigate(user?.roles?.includes("Admin") ? "/admin" : "/vendor");
                      }}
                      sx={{ borderRadius: 1, mx: 0.5 }}
                    >
                      <DashboardIcon fontSize="small" sx={{ mr: 1 }} /> {t("dashboard")}
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={handleLogout}
                    sx={{ borderRadius: 1, mx: 0.5 }}
                  >
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> {t("logout")}
                  </MenuItem>
                </Menu>
                </>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="small"
                  startIcon={<LoginIcon />}
                  sx={{
                    display: { xs: "none", md: "inline-flex" },
                    textTransform: "none",
                    borderRadius: 2,
                    borderColor: "primary.main",
                    color: "primary.main",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "primary.light",
                      bgcolor: "rgba(13,33,55,0.08)",
                    },
                  }}
                >
                  {t("login")}
                </Button>
              )}

              {/* Language Selector */}
              <Box sx={{ display: { xs: "none", md: "flex" } }}>
                <LanguageSelector />
              </Box>

              {/* Theme Toggle */}
              <IconButton
                onClick={toggleMode}
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  color: "text.primary",
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "rotate(30deg)" },
                }}
              >
                {mode === "dark" ? <LightMode /> : <DarkMode />}
              </IconButton>

              {/* Favorites Icon */}
              <IconButton
                component={Link}
                to="/favorites"
                sx={{ color: "text.primary" }}
              >
                <Badge
                  badgeContent={favoriteCount}
                  color="secondary"
                  sx={{ "& .MuiBadge-badge": { fontWeight: 700 } }}
                >
                  <FavoriteIcon
                    sx={{ color: favoriteCount > 0 ? "#e91e63" : "inherit" }}
                  />
                </Badge>
              </IconButton>

              {/* Cart Icon */}
              <IconButton
                component={Link}
                to="/cart"
                sx={{ color: "text.primary" }}
              >
                <Badge
                  badgeContent={itemCount}
                  color="primary"
                  sx={{ "& .MuiBadge-badge": { fontWeight: 700 } }}
                >
                  <ShoppingCart />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              bgcolor: "background.default",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          },
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="img"
              src="/favicon.jpg"
              alt="VMart"
              sx={{
                width: 28, height: 28, borderRadius: 1,
                boxShadow: mode === 'dark' ? '0 0 0 2px rgba(77,184,209,0.4)' : 'none',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: mode === 'dark' ? GRADIENT_DARK : GRADIENT,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              VMart
            </Typography>
          </Box>
        </Link>
        <Divider />
        <List>
          {localizedNavLinks.map((link) => (
            <ListItem key={link.label} disablePadding>
              <ListItemButton
                onClick={() => {
                  setMobileOpen(false);
                  navigate(link.to);
                }}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <Box
              sx={{
                width: "100%",
                mx: 1,
                display: "flex",
                alignItems: "center",
                "& > button": {
                  width: "100%",
                  justifyContent: "flex-start",
                  px: 2,
                },
              }}
            >
              <LanguageSelector />
            </Box>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={toggleMode}
              sx={{ borderRadius: 2, mx: 1 }}
            >
              {mode === "dark" ? (
                <LightMode fontSize="small" sx={{ mr: 1 }} />
              ) : (
                <DarkMode fontSize="small" sx={{ mr: 1 }} />
              )}
              <ListItemText
                primary={mode === "dark" ? t("lightMode") : t("darkMode")}
              />
            </ListItemButton>
          </ListItem>
          {isAuthenticated ? (
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                sx={{ borderRadius: 2, mx: 1 }}
              >
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                <ListItemText primary={t("logout")} />
              </ListItemButton>
            </ListItem>
          ) : (
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/login");
                }}
                sx={{ borderRadius: 2, mx: 1 }}
              >
                <LoginIcon fontSize="small" sx={{ mr: 1 }} />
                <ListItemText primary={t("login")} />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
}
