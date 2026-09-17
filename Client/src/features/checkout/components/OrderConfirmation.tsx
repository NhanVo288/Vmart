import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Fade from "@mui/material/Fade";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import { formatPrice, GRADIENT } from "../../../config/constants";
import type { OrderDto } from "../../../types/order";
import { useTranslation } from "../../../lib/i18n";

interface OrderConfirmationProps {
  email: string;
  order: OrderDto;
}

export function OrderConfirmation({ email, order }: OrderConfirmationProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const ship = order.shippingAddress!;

  return (
    <Fade in>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <CheckCircleRounded sx={{ fontSize: 72, color: "success.main", mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>{t('orderPlaced')}</Typography>
          {order.emailSent === true ? (
            <Typography variant="body1" color="text.secondary">
              {t('thankYouPurchase')} <strong>{email}</strong>.
            </Typography>
          ) : (
            <Alert severity="warning" sx={{ mt: 2, textAlign: "left" }}>
              Your order was created, but the server did not confirm email delivery: {order.emailError ?? "No email delivery status was returned."}
            </Alert>
          )}
        </Box>

        <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>{t('contactStep')}</Typography>
          <Typography variant="body2" color="text.secondary">{email}</Typography>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>{t('shippingTo')}</Typography>
          <Typography variant="body2" color="text.secondary">{ship.name}</Typography>
          <Typography variant="body2" color="text.secondary">{ship.line1}</Typography>
          <Typography variant="body2" color="text.secondary">{ship.city}, {ship.state} {ship.postal_code}</Typography>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>{t('items')} ({order.orderItems.length})</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {order.orderItems.map((item) => (
              <Box key={item.productId} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <Box component="img" src={item.pictureUrl} alt={item.productName}
                  sx={{ width: 44, height: 44, borderRadius: 1.5, objectFit: "cover", flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.productName}</Typography>
                  <Typography variant="caption" color="text.disabled">{t('qty')}: {item.quantity}</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</Typography>
              </Box>
            ))}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">{t('subtotal')}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPrice(order.subtotal)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography variant="body2" color="text.secondary">{t('shipping')}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: order.deliveryFee === 0 ? "success.main" : "text.primary" }}>
                {order.deliveryFee === 0 ? t('free') : formatPrice(order.deliveryFee)}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t('total')}</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {formatPrice(order.total)}
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ textAlign: "center", display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          <Button variant="contained" size="large" onClick={() => navigate(`/orders/${order.id}`)}
            sx={{ borderRadius: 2, textTransform: "none", px: 5, py: 1.5 }}>
            {t('viewMyOrder')}
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate("/orders")}
            sx={{ borderRadius: 2, textTransform: "none", px: 5, py: 1.5 }}>
            {t('allOrders')}
          </Button>
        </Box>
      </Container>
    </Fade>
  );
}
