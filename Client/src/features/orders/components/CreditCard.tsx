import { Box, Typography, useTheme } from "@mui/material";
import type { PaymentSummaryDto } from "../../../types/order";

const segments = [1, 2, 3, 4];

interface CreditCardProps {
  paymentSummary: PaymentSummaryDto;
}

export function CreditCard({ paymentSummary }: CreditCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const cardSx = isDark
    ? {
        background:
          "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        boxShadow: "0 8px 32px rgba(15,52,96,0.5)",
        color: "#fff",
        "&::before": {
          content: '""',
          position: "absolute" as const,
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
        },
        "&::after": {
          content: '""',
          position: "absolute" as const,
          bottom: -40,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
        },
      }
    : {
        background: "linear-gradient(145deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 8px 32px rgba(102,126,234,0.35)",
        color: "#fff",
        "&::before": {
          content: '""',
          position: "absolute" as const,
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
        },
        "&::after": {
          content: '""',
          position: "absolute" as const,
          bottom: -40,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
        },
      };

  return (
    <Box
      sx={{
        position: "relative",
        aspectRatio: "1.586",
        maxWidth: 340,
        borderRadius: 3,
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: '"Courier New", monospace',
        overflow: "hidden",
        ...cardSx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 28,
              borderRadius: "4px",
              background:
                "linear-gradient(135deg, #ffd700 0%, #b8860b 50%, #daa520 100%)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: "3px",
                borderRadius: "2px",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 60%)",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: "1.5px solid rgba(0,0,0,0.15)",
              },
            }}
          />
          <Box sx={{ display: "flex", gap: 0.3, mt: 0.5 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 14 + i * 4,
                  height: 10 + i * 2,
                  borderRadius: "8px 8px 0 0",
                  border: isDark
                    ? "1px solid rgb(252, 247, 247)"
                    : "1px solid rgb(252, 255, 255)",
                  borderBottom: "none",
                  opacity: isDark ? 0.5 - i * 0.1 : 0.8 - i * 0.1,
                }}
              />
            ))}
          </Box>
        </Box>
        <Typography
          component="div"
          sx={{
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: 1.5,
            fontFamily: '"Segoe UI", Arial, sans-serif',
            fontStyle: "italic",
          }}
        >
          {paymentSummary.brand === "mastercard" ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  bgcolor: "#f79e1b",
                  mr: -1,
                }}
              />
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  bgcolor: "#eb001b",
                }}
              />
            </Box>
          ) : paymentSummary.brand === "visa" ? (
            <Box
              sx={{
                color: "#fff",
                fontSize: 22,
                fontWeight: 900,
                fontStyle: "italic",
              }}
            >
              VISA
            </Box>
          ) : (
            paymentSummary.brand.toUpperCase()
          )}
        </Typography>
      </Box>

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 2 }}>
          {segments.map((seg) => (
            <Typography
              key={seg}
              sx={{ fontSize: 20, letterSpacing: 4, fontWeight: 500 }}
            >
              {seg === 4 ? String(paymentSummary.last4) : "••••"}
            </Typography>
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: 8, opacity: 0.6, letterSpacing: 1.5, mb: 0.3 }}
            >
              VALID THRU
            </Typography>
            <Typography
              sx={{ fontSize: 14, fontWeight: 600, letterSpacing: 2 }}
            >
              {String(paymentSummary.expMonth).padStart(2, "0")}/
              {String(paymentSummary.expYear).slice(-2)}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 10, opacity: 0.4, letterSpacing: 1 }}>
            RESTORE
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
