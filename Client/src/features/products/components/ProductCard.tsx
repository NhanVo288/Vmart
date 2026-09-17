import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import type { IProduct } from "../../../types/product";
import { formatPrice } from '../../../config/constants';
import { FavoriteButton } from '../../../components/ui/FavoriteButton';
import { NotifyMeButton } from '../../../components/ui/NotifyMeButton';
import { handleAddToCart } from '../../../hooks/useAddToCart';
import { useGetBasketQuery } from '../../../stores/basketApi';

import { useTranslation } from '../../../lib/i18n';

interface ProductCardProps {
  product: IProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const canHover = useMediaQuery('(hover: hover)');
  const navigate = useNavigate();
  const { data: basket } = useGetBasketQuery();
  const inCart = basket?.items.some(i => i.productId === product.id) ?? false;

  const isActive = canHover ? isHovered : isTapped;

  const handleInteraction = () => {
    if (canHover) {
      navigate(`/items/${product.id}`);
    } else {
      setIsTapped((prev) => !prev);
    }
  };

  return (
    <Card
      onMouseEnter={canHover ? () => setIsHovered(true) : undefined}
      onMouseLeave={canHover ? () => setIsHovered(false) : undefined}
      onClick={handleInteraction}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: isActive ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isActive
          ? '0 20px 40px rgba(0,0,0,0.15)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
      }}
    >
      {/* Image Section */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="220"
          image={product.pictureUrl}
          alt={product.name}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            transform: isActive ? 'scale(1.1)' : 'scale(1)',
          }}
        />

        {/* Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: isActive
              ? 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%)'
              : 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 40%)',
            transition: 'background 0.3s ease',
          }}
        />

        {/* Price Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {formatPrice(product.price)}
        </Box>

        {/* Favorite Button */}
        <FavoriteButton
          productId={product.id}
          sx={{ position: 'absolute', top: 8, left: 8 }}
        />

        {/* Action Buttons (hover on desktop, toggle on mobile) */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            display: 'flex',
            gap: 1,
            transform: isActive ? 'translateY(0)' : 'translateY(100%)',
            opacity: isActive ? 1 : 0,
            transition: 'all 0.3s ease',
          }}
        >
          <Button
            variant={inCart ? "outlined" : "contained"}
            size="small"
            fullWidth
            disabled={inCart || product.quantityInStock === 0}
            onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id, 1); }}
            startIcon={inCart ? <CheckCircleRounded sx={{ fontSize: 16 }} /> : undefined}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              backdropFilter: 'blur(4px)',
              color: inCart ? '#4ade80' : '#fff',
              borderColor: inCart ? 'rgba(74, 222, 128, 0.5)' : undefined,
              bgcolor: inCart ? 'rgba(74, 222, 128, 0.08)' : undefined,
              opacity: 1,
              '&.Mui-disabled': {
                color: '#4ade80',
                borderColor: 'rgba(74, 222, 128, 0.5)',
                bgcolor: 'rgba(74, 222, 128, 0.08)',
                opacity: 1,
              },
            }}
          >
            {product.quantityInStock === 0 ? t('outOfStock') : inCart ? '✓' : t('addToCart')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={(e) => { e.stopPropagation(); navigate(`/items/${product.id}`); }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            {t('viewDetails')}
          </Button>
          {product.quantityInStock === 0 && (
            <NotifyMeButton productId={product.id} compact />
          )}
        </Box>
      </Box>

      {/* Content Section */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, pt: 2 }}>
        <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600 }} noWrap>
          {product.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.5,
          }}
        >
          {product.description}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 1 }}>
          <Chip
            label={product.brand}
            size="small"
            variant="filled"
            sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 600 }}
          />
          <Chip label={product.type} size="small" variant="outlined" color="default" />
        </Stack>
      </CardContent>
    </Card>
  );
}
