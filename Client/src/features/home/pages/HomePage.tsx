import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Fade from '@mui/material/Fade';
import ArrowForward from '@mui/icons-material/ArrowForward';
import LocalShippingRounded from '@mui/icons-material/LocalShippingRounded';
import SupportAgentRounded from '@mui/icons-material/SupportAgentRounded';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import ReplayRounded from '@mui/icons-material/ReplayRounded';
import { ProductCard } from '../../products/components/ProductCard';
import { useGetProductsQuery } from '../../../stores/productApi';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { GRADIENT, GRADIENT_DARK } from '../../../config/constants';
import type { IProduct } from '../../../types/product';
import { useTranslation } from '../../../lib/i18n';

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: productsData, isLoading } = useGetProductsQuery({ pageNumber: 1, pageSize: 8, orderBy: 'name', ascending: true });
  const featured: IProduct[] = productsData?.items ?? [];

  const CATEGORIES = [
    { label: t('catLaptops'), type: 'laptops', image: '/images/products/laptop-macbook-air.jpg' },
    { label: t('catDesktops'), type: 'desktops', image: '/images/products/desktop-mac-studio.jpg' },
    { label: t('catGraphicsCards'), type: 'graphics-cards', image: '/images/products/gpu-rtx.jpg' },
    { label: t('catProcessors'), type: 'processors', image: '/images/products/cpu-amd.jpg' },
    { label: t('catMemory'), type: 'memory', image: '/images/products/ram-corsair.jpg' },
    { label: t('catStorage'), type: 'storage', image: '/images/products/ssd-storage.jpg' },
    { label: t('catMonitors'), type: 'monitors', image: '/images/products/monitor.jpg' },
    { label: t('catPeripherals'), type: 'peripherals', image: '/images/products/mouse.jpg' },
  ];

  const PERKS = [
    { icon: <LocalShippingRounded sx={{ fontSize: 28 }} />, title: t('freeShipping'), desc: t('onOrdersOver') },
    { icon: <SupportAgentRounded sx={{ fontSize: 28 }} />, title: t('expertSupport'), desc: t('dedicatedHelp') },
    { icon: <SecurityRounded sx={{ fontSize: 28 }} />, title: t('securePayment'), desc: t('protectedCheckout') },
    { icon: <ReplayRounded sx={{ fontSize: 28 }} />, title: t('easyReturns'), desc: t('returnPolicy') },
  ];

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={(theme) => ({
          pt: { xs: 8, md: 12 },
          pb: { xs: 7, md: 10 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)'
              : 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 50%, #faf5ff 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 20% 50%, rgba(96,165,250,0.12) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(129,140,248,0.08) 0%, transparent 60%)'
                : 'radial-gradient(circle at 20% 50%, rgba(37,99,235,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(79,70,229,0.04) 0%, transparent 60%)',
            pointerEvents: 'none',
          },
        })}
      >
        <Container maxWidth="md" sx={{ position: 'relative' }}>
          <Typography
            variant="h2"
            sx={(theme) => ({
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '3.5rem' },
              letterSpacing: '-0.5px',
              background:
                theme.palette.mode === 'dark' ? GRADIENT_DARK : GRADIENT,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            })}
          >
            {t('heroTitle')}
          </Typography>
          <Typography
            variant="h6"
            sx={(theme) => ({
              fontWeight: 400,
              color: theme.palette.mode === 'dark' ? 'rgba(241,245,249,0.5)' : 'text.secondary',
              mb: 4,
              maxWidth: 560,
              mx: 'auto',
            })}
          >
            {t('heroSubtitle')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/products')}
              sx={{
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              {t('shopNow')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/products')}
              sx={{
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              {t('browseCatalog')}
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Categories */}
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
          {t('shopByCategory')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 5 }}>
          {t('findWhatYouNeed')}
        </Typography>
        <Grid container spacing={3}>
          {CATEGORIES.map((cat) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={cat.type}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.12)' },
                }}
              >
                <CardActionArea onClick={() => navigate(`/products?type=${cat.type}`)}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={cat.image}
                    alt={cat.label}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ textAlign: 'center', py: 1.75 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {cat.label}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products */}
      {isLoading ? (
        <LoadingSkeleton variant="card" count={8} />
      ) : featured.length > 0 ? (
        <Box
          sx={(theme) => ({
            py: { xs: 5, md: 7 },
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, rgba(30,41,59,0.5) 0%, rgba(30,41,59,0.8) 100%)'
                : 'linear-gradient(180deg, transparent 0%, rgba(37,99,235,0.03) 100%)',
          })}
        >
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {t('featuredProducts')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('handPicked')}
                </Typography>
              </Box>
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/products')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'inline-flex' },
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  '& .MuiSvgIcon-root': { transition: 'transform 0.2s ease' },
                  '&:hover': {
                    '& .MuiSvgIcon-root': { transform: 'translateX(4px)' },
                  },
                }}
              >
                {t('viewAll')}
              </Button>
            </Box>
            <Grid container spacing={3}>
              {featured.map((product, i) => (
                <Fade key={product.id} in timeout={200 + i * 40}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <ProductCard product={product} />
                  </Grid>
                </Fade>
              ))}
            </Grid>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/products')}
              sx={{
                mt: 4,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                display: { sm: 'none' },
              }}
            >
              {t('viewAllProducts')}
            </Button>
          </Container>
        </Box>
      ) : null}

      {/* Perks */}
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={4}>
          {PERKS.map((perk) => (
            <Grid size={{ xs: 6, md: 3 }} key={perk.title}>
              <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main' }}>{perk.icon}</Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {perk.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem' }}>
                  {perk.desc}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Banner */}
      <Box
        sx={(theme) => ({
          py: { xs: 5, md: 7 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)'
              : 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 50%, #faf5ff 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 50% 50%, rgba(96,165,250,0.1) 0%, transparent 60%)'
                : 'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.06) 0%, transparent 60%)',
            pointerEvents: 'none',
          },
        })}
      >
        <Container maxWidth="md" sx={{ position: 'relative' }}>
          <Typography
            variant="h4"
            sx={(theme) => ({
              fontWeight: 700,
              mb: 2,
              background:
                theme.palette.mode === 'dark' ? GRADIENT_DARK : GRADIENT,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            })}
          >
            {t('readyToUpgrade')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}>
            {t('exploreFullCatalog')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/products')}
            sx={{
              fontWeight: 700,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            {t('exploreProducts')}
          </Button>
        </Container>
      </Box>
    </Box>
  );
}