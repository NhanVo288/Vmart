import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import ShoppingBag from "@mui/icons-material/ShoppingBag";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useGetBasketQuery, useUpdateBasketMutation, useRemoveProductFromBasketMutation } from "../../../stores/basketApi";
import { CartItem } from "../components/CartItem";
import { CartSummary } from "../components/CartSummary";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";

import { useTranslation } from "../../../lib/i18n";

export function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: basket, isLoading, error } = useGetBasketQuery();
  const [updateBasket] = useUpdateBasketMutation();
  const [removeProduct] = useRemoveProductFromBasketMutation();

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (!basket || quantity < 1) return;
    const items = basket.items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    );
    updateBasket(items);
  };

  const handleRemove = (productId: number) => {
    removeProduct(productId);
  };

  if (isLoading) return <LoadingSkeleton variant="cart" />;

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{t("errorOccurred")}</Alert>
      </Container>
    );
  }

  if (!basket || basket.items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <ShoppingBag sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
          {t("emptyCartMessage")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t("emptyCartSubtitle")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/")}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          {t("startShopping")}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
        <ShoppingBag sx={{ color: "primary.main", fontSize: 28 }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {t("cartTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          ({basket.items.length} {t("itemsInCart")})
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            {basket.items.map((item, index) => (
              <Box key={item.productId}>
                {index > 0 && <Divider sx={{ mx: 2 }} />}
                <CartItem
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <CartSummary items={basket.items} deliveryFee={basket.deliveryFee} discount={basket.discount} />
        </Grid>
      </Grid>

      {/* Continue Shopping */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/")}
        sx={{ mt: 3, textTransform: "none", fontWeight: 500, borderRadius: 2 }}
      >
        {t("startShopping")}
      </Button>
    </Container>
  );
}
