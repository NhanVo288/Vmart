import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import LocalOffer from "@mui/icons-material/LocalOffer";
import Inventory from "@mui/icons-material/Inventory";
import { useProduct } from "../../../hooks/useProduct";
import { FavoriteButton } from "../../../components/ui/FavoriteButton";
import { NotifyMeButton } from "../../../components/ui/NotifyMeButton";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { handleAddToCart } from "../../../hooks/useAddToCart";
import { GRADIENT, formatPrice } from "../../../config/constants";
import { useGetBasketQuery } from "../../../stores/basketApi";
import { useTranslation } from "../../../lib/i18n";

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { product, loading, error } = useProduct(Number(id));
  const { data: basket } = useGetBasketQuery();
  const cartItem = basket?.items.find(i => i.productId === Number(id));

  const [quantity, setQuantity] = useState(cartItem?.quantity ?? 1);
  const isDisabled = product !== null && !!cartItem && cartItem.quantity === quantity;

  useEffect(() => {
    setQuantity(cartItem?.quantity ?? 1);
  }, [id, cartItem?.quantity]);

  if (loading) return <LoadingSkeleton variant="detail" />;

  if (error)
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  if (!product)
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">{t('productNotFound')}</Alert>
      </Container>
    );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, textTransform: "none", fontWeight: 500, borderRadius: 2 }}
      >
        {t('back')}
      </Button>

      <Grid container spacing={{ xs: 2, md: 5 }}>
        {/* Image Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              position: "relative",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <Box
              component="img"
              src={product.pictureUrl}
              alt={product.name}
              sx={{
                width: "100%",
                height: { xs: 300, md: 500 },
                objectFit: "cover",
                display: "block",
                transition: "transform 0.5s ease",
                "&:hover": { transform: "scale(1.05)" },
              }}
            />
            <FavoriteButton
              productId={product.id}
              size="medium"
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                backdropFilter: "blur(8px)",
              }}
            />
          </Box>
        </Grid>

        {/* Details Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Category Chips */}
            <Stack direction="row" spacing={1}>
              <Chip
                icon={<LocalOffer sx={{ fontSize: 14 }} />}
                label={product.brand}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<Inventory sx={{ fontSize: 14 }} />}
                label={product.type}
                size="small"
                variant="outlined"
              />
            </Stack>

            {/* Name & Price */}
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              {product.name}
            </Typography>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background:
                    GRADIENT,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block",
                }}
              >
                {formatPrice(product.price)}
              </Typography>
            </Box>

            <Divider />

            {/* Description */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {t('description')}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.7 }}
              >
                {product.description}
              </Typography>
            </Box>

            <Divider />

            {/* Stock Info */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color:
                  product.quantityInStock > 0 ? "success.main" : "error.main",
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor:
                    product.quantityInStock > 0 ? "success.main" : "error.main",
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {product.quantityInStock > 0
                  ? `${product.quantityInStock} ${t('xInStock')}`
                  : t('outOfStock')}
              </Typography>
            </Box>

            {/* Quantity Selector */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.secondary" }}
              >
                {t('quantity')}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 0.5,
                }}
              >
                <Button
                  size="small"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  sx={{
                    minWidth: 32,
                    height: 32,
                    borderRadius: 1.5,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  -
                </Button>
                <Typography
                  sx={{
                    minWidth: 40,
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  {quantity}
                </Typography>
                <Button
                  size="small"
                  onClick={() =>
                    setQuantity(Math.min(product.quantityInStock, quantity + 1))
                  }
                  sx={{
                    minWidth: 32,
                    height: 32,
                    borderRadius: 1.5,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                  }}
                >
                  +
                </Button>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2}>
              {product.quantityInStock === 0 ? (
                <Box sx={{ flex: 1 }}>
                  <NotifyMeButton productId={product.id} />
                </Box>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={isDisabled ? <CheckCircleRounded /> : <ShoppingCart />}
                  disabled={isDisabled}
                  onClick={() => handleAddToCart(product.id, quantity)}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
                    '&.Mui-disabled': isDisabled ? {
                      color: '#4ade80',
                      bgcolor: 'rgba(74, 222, 128, 0.08)',
                      opacity: 1,
                    } : undefined,
                  }}
                >
                  {isDisabled ? t('inCart') : t('addToCart')}
                </Button>
              )}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProductDetailsPage;
