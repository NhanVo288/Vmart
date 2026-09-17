import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useGetBasketQuery } from "../../../stores/basketApi";
import { CheckoutContent } from "../components/CheckoutContent";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { GRADIENT } from "../../../config/constants";
import { useTranslation } from "../../../lib/i18n";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: basket, isLoading } = useGetBasketQuery();

  if (isLoading) return <LoadingSkeleton variant="checkout" />;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
        <Button
          size="small" startIcon={<ArrowBack />}
          onClick={() => navigate("/cart")}
          sx={{ textTransform: "none", borderRadius: 2, color: "text.secondary" }}
        >
          {t('back')}
        </Button>
        <Box sx={{ flex: 1 }} />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            background: GRADIENT,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t('checkoutTitle')}
        </Typography>
      </Box>

      <CheckoutContent basket={basket} />
    </Container>
  );
}
