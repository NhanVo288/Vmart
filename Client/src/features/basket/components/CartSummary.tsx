import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import ShoppingCartCheckout from "@mui/icons-material/ShoppingCartCheckout";
import { GRADIENT, formatPrice } from "../../../config/constants";
import type { IBasketItem } from "../../../types/basket";

import { useTranslation } from "../../../lib/i18n";

interface CartSummaryProps {
  items: IBasketItem[];
  deliveryFee?: number;
  discount?: number;
}

export function CartSummary({ items, deliveryFee, discount }: CartSummaryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const fee = deliveryFee != null ? deliveryFee : (subtotal > 100 ? 0 : 5);
  const disc = discount != null ? discount : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        position: "sticky",
        top: 88,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {t("subtotal")}
      </Typography>

      <Stack spacing={1.5}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            {t("item")} ({items.length})
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatPrice(subtotal)}
          </Typography>
        </Box>

        {disc > 0 && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="success.main">Discount</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>
              -{formatPrice(disc)}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            {t("deliveryFee")}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: fee === 0 ? "success.main" : "text.primary" }}>
            {fee === 0 ? "Free" : formatPrice(fee)}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {t("total")}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
               background: GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {formatPrice(subtotal + fee - disc)}
          </Typography>
        </Box>
      </Stack>

      <Button
        variant="contained"
        fullWidth
        size="large"
        startIcon={<ShoppingCartCheckout />}
        onClick={() => navigate("/checkout")}
        sx={{
          mt: 3,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          py: 1.5,
        }}
      >
        {t("checkout")}
      </Button>

      <Typography variant="caption" color="text.disabled" sx={{ display: "block", textAlign: "center", mt: 1.5 }}>
        Thanh toán VietQR được xác nhận bởi SePay
      </Typography>
    </Paper>
  );
}
