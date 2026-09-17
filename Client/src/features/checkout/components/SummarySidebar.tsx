import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Lock from "@mui/icons-material/Lock";
import { formatPrice, GRADIENT } from "../../../config/constants";
import type { IBasket } from "../../../types/basket";
import { useTranslation } from "../../../lib/i18n";

export function SummarySidebar({ basket, subtotal, deliveryFee, total }: {
  basket: IBasket; subtotal: number; deliveryFee: number; total: number;
}) {
  const { t } = useTranslation();
  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", position: "sticky", top: 88 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{t('orderSummary')}</Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          {basket.items.map((item) => (
            <Box key={item.productId} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Box
                component="img" src={item.pictureUrl} alt={item.productName}
                sx={{ width: 48, height: 48, borderRadius: 1.5, objectFit: "cover", flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.productName}
                </Typography>
                <Typography variant="caption" color="text.disabled">{t('qty')}: {item.quantity}</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, flexShrink: 0 }}>
                {formatPrice(item.price * item.quantity)}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">{t('subtotal')}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPrice(subtotal)}</Typography>
        </Box>

        {basket.discount != null && basket.discount > 0 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="success.main">{t('discount')}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>
              -{formatPrice(basket.discount)}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">{t('shipping')}</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: deliveryFee === 0 ? "success.main" : "text.primary" }}>
            {deliveryFee === 0 ? t('free') : formatPrice(deliveryFee)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t('total')}</Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              background: GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {formatPrice(total)}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
          <Lock sx={{ fontSize: 14, color: "text.disabled" }} />
          <Typography variant="caption" color="text.disabled">{t('securedBySepay')}</Typography>
        </Box>
      </Paper>
    </Grid>
  );
}
