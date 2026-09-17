import IconButton from '@mui/material/IconButton';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import type { SxProps, Theme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import { useGetFavoriteQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from '../../stores/favoriteApi';

interface FavoriteButtonProps {
  productId: number;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
}

export function FavoriteButton({ productId, size = 'small', sx }: FavoriteButtonProps) {
  const { data: favorite } = useGetFavoriteQuery();
  const [addFavorite, { isLoading: isAdding }] = useAddFavoriteMutation();
  const [removeFavorite, { isLoading: isRemoving }] = useRemoveFavoriteMutation();

  const isFavorited = favorite?.items.some((i) => i.productId === productId) ?? false;
  const isLoading = isAdding || isRemoving;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFavorited) {
        await removeFavorite(productId).unwrap();
      } else {
        await addFavorite(productId).unwrap();
      }
    } catch { /* Handled by baseApi */ }
  };

  return (
    <IconButton
      onClick={handleToggle}
      size={size}
      disabled={isLoading}
      sx={{
        color: isFavorited ? 'error.main' : 'white',
        bgcolor: isFavorited ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.3)',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
        '&.Mui-disabled': {
          bgcolor: isFavorited ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.3)',
        },
        transition: 'all 0.2s ease',
        ...sx,
      }}
    >
      {isLoading
        ? <CircularProgress size={size === 'small' ? 16 : 20} color="error" />
        : isFavorited
          ? <Favorite fontSize={size} />
          : <FavoriteBorder fontSize={size} />}
    </IconButton>
  );
}
