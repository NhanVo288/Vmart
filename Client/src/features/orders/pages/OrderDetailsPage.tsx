import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Chip, Divider,
  Alert, Button,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useGetOrderByIdQuery } from '../../../stores/orderApi';
import { GRADIENT, formatPrice } from '../../../config/constants';
import { CreditCard } from '../components/CreditCard';
import { PageLayout } from '../../../components/layout/PageLayout';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';

const statusColors: Record<string, 'warning' | 'info' | 'error' | 'success' | 'default'> = {
  Pending: 'warning',
  PaymentReceived: 'info',
  PaymentFailed: 'error',
  Shipped: 'info',
  Delivered: 'success',
  Cancelled: 'error',
};

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useGetOrderByIdQuery(Number(id));

  if (isLoading) return <LoadingSkeleton variant="order-detail" />;

  if (error || !order) {
    return (
      <PageLayout maxWidth="md">
        <Alert severity="error" sx={{ borderRadius: 2 }}>Order not found</Alert>
        <Button onClick={() => navigate('/orders')} sx={{ mt: 2, textTransform: 'none', borderRadius: 2 }}>
          Back to Orders
        </Button>
      </PageLayout>
    );
  }

  const itemsTotal = order.orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <PageLayout>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/orders')}
        sx={{ mb: 3, textTransform: 'none', borderRadius: 2, color: 'text.secondary' }}
      >
        Back to Orders
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box
          sx={{
            bgcolor: 'background.default',
            borderRadius: '50%',
            p: 1.2,
            display: 'flex',
            boxShadow: '0 4px 20px rgba(13,33,55,0.2)',
          }}
        >
          <ReceiptLongIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        </Box>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: GRADIENT,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Order #{order.id}
          </Typography>
          <Typography variant="body2" color="text.secondary" component="span">
            {new Date(order.orderDate).toLocaleDateString()} &middot; <Chip label={order.status} size="small" color={statusColors[order.status] ?? 'default'} sx={{ fontWeight: 600, borderRadius: 1.5 }} />
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Shipping */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LocalShippingIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Shipping Address</Typography>
            </Box>
            {order.shippingAddress ? (
              <>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.shippingAddress.name}</Typography>
                <Typography variant="body2" color="text.secondary">{order.shippingAddress.line1}</Typography>
                {order.shippingAddress.line2 && (
                  <Typography variant="body2" color="text.secondary">{order.shippingAddress.line2}</Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}
                </Typography>
                <Typography variant="body2" color="text.secondary">{order.shippingAddress.country}</Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">Shipping address not available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Payment */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CreditCardIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Payment</Typography>
            </Box>
            {order.paymentSummary ? (
              <CreditCard paymentSummary={order.paymentSummary} />
            ) : (
              <Typography variant="body2" color="text.secondary">Payment details not available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Order Items */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <ShoppingBagIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Items ({order.orderItems.length})</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {order.orderItems.map((item) => (
                <Box key={item.productId} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={item.pictureUrl}
                    alt={item.productName}
                    sx={{ width: 56, height: 56, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.productName}</Typography>
                    <Typography variant="caption" color="text.disabled">Qty: {item.quantity}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatPrice(item.price * item.quantity)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPrice(itemsTotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Delivery Fee</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: order.deliveryFee === 0 ? 'success.main' : 'text.primary' }}>
                  {order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)}
                </Typography>
              </Box>
              {order.discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="success.main">Discount</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                    -{formatPrice(order.discount)}
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, background: GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {formatPrice(order.total)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </PageLayout>
  );
}
