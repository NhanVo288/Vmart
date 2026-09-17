import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardMedia, CardContent,
  Button, IconButton, Tooltip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageLayout } from '../../../components/layout/PageLayout';
import {
  useGetFavoriteQuery,
  useRemoveFavoriteMutation,
  useDeleteFavoriteMutation,
} from '../../../stores/favoriteApi';
import { useAddProductToBasketMutation } from '../../../stores/basketApi';
import { GRADIENT, formatPrice } from '../../../config/constants';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { useTranslation } from '../../../lib/i18n';

export function FavoritesPage() {
  const { t } = useTranslation();
  const { data: favorite, isLoading } = useGetFavoriteQuery();
  const [removeFavorite, { isLoading: isRemoving }] = useRemoveFavoriteMutation();
  const [deleteFavorite, { isLoading: isClearing }] = useDeleteFavoriteMutation();
  const [addToBasket, { isLoading: isAddingBasket }] = useAddProductToBasketMutation();

  const handleRemove = async (productId: number) => {
    try {
      await removeFavorite(productId).unwrap();
    } catch { /* Handled by baseApi */ }
  };

  const handleClearAll = async () => {
    try {
      await deleteFavorite().unwrap();
    } catch { /* Handled by baseApi */ }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await addToBasket([{ productId, quantity: 1 }]).unwrap();
    } catch { /* Handled by baseApi */ }
  };

  if (isLoading) return <LoadingSkeleton variant="card" count={8} />;

  const items = favorite?.items ?? [];

  return (
    <PageLayout>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                bgcolor: 'background.default',
                borderRadius: '50%',
                p: 1.5,
                display: 'flex',
                boxShadow: '0 4px 20px rgba(233, 30, 99, 0.25)',
              }}
            >
              <FavoriteIcon sx={{ color: 'primary.main', fontSize: 32 }} />
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
                {t('myFavorites')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {items.length} {items.length === 1 ? t('itemSaved') : t('itemsSaved')}
              </Typography>
            </Box>
          </Box>

          {items.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleClearAll}
              disabled={isClearing}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              {t('clearAll')}
            </Button>
          )}
        </Box>

        {items.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              borderRadius: 4,
              backdropFilter: 'blur(20px)',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(15,20,30,0.7)' : 'rgba(255,255,255,0.7)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            }}
          >
            <FavoriteIcon sx={{ fontSize: 72, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {t('yourWishlistEmpty')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('exploreAndSave')}
            </Typography>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1,
                background: GRADIENT,
              }}
            >
              {t('browseProducts')}
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid key={item.productId} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    backdropFilter: 'blur(20px)',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(15,20,30,0.85)' : 'rgba(255,255,255,0.85)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(233, 30, 99, 0.15)',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', pt: '100%' }}>
                    <CardMedia
                      component="img"
                      image={item.pictureUrl}
                      alt={item.productName}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        p: 2,
                      }}
                    />
                    <Tooltip title={t('removeFromFavorites')}>
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(item.productId)}
                        disabled={isRemoving}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(255,255,255,0.8)',
                          backdropFilter: 'blur(4px)',
                          color: '#e91e63',
                          '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                        }}
                      >
                        <FavoriteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {item.brand} • {item.type}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.productName}
                    </Typography>

                    <Box sx={{ mt: 'auto', pt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {formatPrice(item.price)}
                      </Typography>

                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<AddShoppingCartIcon fontSize="small" />}
                        onClick={() => handleAddToCart(item.productId)}
                        disabled={isAddingBasket}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          background: GRADIENT,
                        }}
                      >
                        {t('addToCart')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
    </PageLayout>
  );
}
