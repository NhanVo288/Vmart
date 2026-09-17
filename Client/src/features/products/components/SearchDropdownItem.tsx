import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { formatPrice } from '../../../config/constants';
import type { IProduct } from '../../../types/product';

interface SearchDropdownItemProps {
  product: IProduct;
}

export function SearchDropdownItem({ product }: SearchDropdownItemProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        width: '100%',
        py: 0.5,
      }}
    >
      {/* Product Image Thumbnail */}
      <Box
        component="img"
        src={product.pictureUrl}
        alt={product.name}
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          objectFit: 'cover',
          border: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
          bgcolor: 'background.paper',
        }}
      />

      {/* Main Info */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Chip
            label={product.brand}
            size="small"
            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 500 }}
          />
          <Chip
            label={product.type}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        </Box>
      </Box>

      {/* Price Badge */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          color: 'primary.main',
          bgcolor: 'action.hover',
          px: 1.5,
          py: 0.5,
          borderRadius: 1.5,
          flexShrink: 0,
        }}
      >
        {formatPrice(product.price)}
      </Typography>
    </Box>
  );
}
