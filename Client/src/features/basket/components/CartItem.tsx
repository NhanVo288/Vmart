import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import { formatPrice, GRADIENT } from "../../../config/constants";
import type { IBasketItem } from "../../../types/basket";

interface CartItemProps {
  item: IBasketItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [bump, setBump] = useState(false);

  useEffect(() => {
    setBump(true);
    const t = setTimeout(() => setBump(false), 200);
    return () => clearTimeout(t);
  }, [item.quantity]);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2.5,
        p: 2,
        borderRadius: 3,
        transition: "background-color 0.2s",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      {/* Image */}
      <Box
        component="img"
        src={item.pictureUrl}
        alt={item.productName}
        sx={{
          width: 96,
          height: 96,
          borderRadius: 2.5,
          objectFit: "cover",
          flexShrink: 0,
          border: "1px solid",
          borderColor: "divider",
        }}
      />

      {/* Info */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0, // عشان الـ text ellipsis يشتغل صح
        }}
      >
        {/* Title + Delete */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.productName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {item.brand} · {item.type}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={() => onRemove(item.productId)}
            sx={{
              color: "text.disabled",
              flexShrink: 0,
              "&:hover": { color: "error.main", bgcolor: "error.lighter" },
            }}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Box>

    {/* Quantity + Price */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "auto",
            pt: 1.5,
          }}
        >
          {/* Quantity Stepper */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <IconButton
              size="small"
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              sx={{
                width: 34,
                height: 34,
                borderRadius: 0,
                color: "text.secondary",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: "1.1rem", lineHeight: 1 }}>−</Typography>
            </IconButton>

            <Box
              sx={{
                minWidth: 44,
                textAlign: "center",
                py: 0.5,
                bgcolor: "action.hover",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "text.primary",
                  transition: "transform 0.2s ease, opacity 0.2s ease",
                  transform: bump ? "scale(1.3)" : "scale(1)",
                  opacity: bump ? 0.6 : 1,
                }}
              >
                {item.quantity}
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.quantityInStock}
              sx={{
                width: 34,
                height: 34,
                borderRadius: 0,
                color: "text.secondary",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: "1.1rem", lineHeight: 1 }}>+</Typography>
            </IconButton>
          </Box>

          {item.quantity >= item.quantityInStock && (
            <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, fontSize: "0.7rem" }}>
              Max stock: {item.quantityInStock}
            </Typography>
          )}

         {/* Price */}
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" color="text.disabled" sx={{ display: "block", fontSize: "0.7rem", lineHeight: 1.2 }}>
              {formatPrice(item.price)} × {item.quantity}
            </Typography>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.1rem",
                background: GRADIENT,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {formatPrice(item.price * item.quantity)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}