import { useNavigate } from "react-router-dom";
import { useGetVendorDashboardQuery, useGetVendorOrdersQuery } from "../../../stores/vendorApi";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useThemeMode } from "../../../providers/ThemeProvider";
import { GRADIENT, GRADIENT_DARK } from "../../../config/constants";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";

const statusColors: Record<string, "warning" | "info" | "error" | "primary" | "success" | "default"> = {
  Pending: "warning",
  PaymentReceived: "info",
  PaymentFailed: "error",
  Shipped: "primary",
  Delivered: "success",
  Cancelled: "default",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VendorDashboardPage() {
  const navigate = useNavigate();
  const { data: dashboard, isLoading: loadingDashboard } = useGetVendorDashboardQuery();
  const { data: orders, isLoading: loadingOrders } = useGetVendorOrdersQuery({ pageNumber: 1, pageSize: 5, orderBy: "orderDate", ascending: false });
  const { mode } = useThemeMode();
  const isLoading = loadingDashboard || loadingOrders;

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  const stats = [
    { label: "My Products", value: dashboard?.totalProducts ?? 0, icon: <Inventory2Icon /> },
    { label: "My Orders", value: dashboard?.totalOrders ?? 0, icon: <ShoppingBagIcon /> },
    { label: "Revenue", value: `VND${(dashboard?.totalRevenue ?? 0).toLocaleString()}`, icon: <AttachMoneyIcon /> },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Vendor Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Welcome back! Here&apos;s what&apos;s happening with your products.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/vendor/products/new")}
          sx={{
            background: mode === "dark" ? GRADIENT_DARK : GRADIENT,
            color: "#fff",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            display: { xs: "none", sm: "inline-flex" },
          }}
        >
          Add Product
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 6, sm: 4 }} key={stat.label}>
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                p: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                {stat.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: "1.15rem" }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ReceiptLongIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Recent Orders
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate("/vendor/orders")}
                sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, fontSize: "0.8rem" }}
              >
                View All
              </Button>
            </Box>
            {orders?.items.length ? (
              <Box>
                {orders.items.map((order, idx) => (
                  <Box
                    key={order.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2.5,
                      py: 1.5,
                      borderBottom: idx < orders.items.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                      transition: "background 0.15s ease",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          fontFamily: "monospace",
                        }}
                      >
                        #{order.id}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          VND{order.vendorSubtotal.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(order.orderDate)}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={order.status}
                      size="small"
                      color={statusColors[order.status] ?? "default"}
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <ShoppingBagIcon sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No orders yet</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
            </Box>
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Inventory2Icon />}
                onClick={() => navigate("/vendor/products")}
                sx={{
                  justifyContent: "flex-start",
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                }}
              >
                Manage Products
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ShoppingBagIcon />}
                onClick={() => navigate("/vendor/orders")}
                sx={{
                  justifyContent: "flex-start",
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                }}
              >
                View Orders
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
