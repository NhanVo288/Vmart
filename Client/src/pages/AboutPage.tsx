import { useTheme } from '@mui/material/styles';
import { Box, Typography, Grid, Paper, Container } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DiamondIcon from '@mui/icons-material/Diamond';
import GroupsIcon from '@mui/icons-material/Groups';
import RocketIcon from '@mui/icons-material/Rocket';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { GRADIENT, GRADIENT_DARK } from '../config/constants';
import { useTranslation } from '../lib/i18n';

export function AboutPage() {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const values = [
    { icon: <DiamondIcon />, title: t('qualityFirst'), desc: t('qualityFirstDesc') },
    { icon: <GroupsIcon />, title: t('communityDriven'), desc: t('communityDrivenDesc') },
    { icon: <RocketIcon />, title: t('fastReliable'), desc: t('fastReliableDesc') },
    { icon: <ShoppingBagIcon />, title: t('secureShoppingTitle'), desc: t('secureShoppingDesc') },
  ];

  return (
    <Box>
      <Box
        sx={(t) => ({
          pt: { xs: 8, md: 12 },
          pb: { xs: 7, md: 10 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: t.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)'
            : 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 50%, #faf5ff 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: t.palette.mode === 'dark'
              ? 'radial-gradient(circle at 20% 50%, rgba(96,165,250,0.12) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(129,140,248,0.08) 0%, transparent 60%)'
              : 'radial-gradient(circle at 20% 50%, rgba(37,99,235,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(79,70,229,0.04) 0%, transparent 60%)',
            pointerEvents: 'none',
          },
        })}
      >
        <Container maxWidth="md" sx={{ position: 'relative' }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '3.5rem' },
              letterSpacing: '-0.5px',
              background: mode === 'dark' ? GRADIENT_DARK : GRADIENT,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            {t('aboutTitle')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              color: mode === 'dark' ? 'rgba(241,245,249,0.5)' : 'text.secondary',
              maxWidth: 560,
              mx: 'auto',
              lineHeight: 1.8,
            }}
          >
            {t('aboutSubtitle')}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, mb: 6, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={4} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                {t('aboutStory1')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, lineHeight: 1.9 }}>
                {t('aboutStory2')}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                component="img"
                src="/favicon.jpg"
                alt="VMart"
                sx={{
                  width: '100%', maxWidth: 250, display: 'block', mx: 'auto',
                  borderRadius: 3,
                  boxShadow: mode === 'dark' ? '0 8px 40px rgba(96,165,250,0.15)' : '0 8px 40px rgba(37,99,235,0.15)',
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
          {t('ourValues')}
        </Typography>

        <Grid container spacing={3}>
          {values.map((v) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={v.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 3, textAlign: 'center', borderRadius: 3, height: '100%',
                  border: '1px solid', borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)',
                    boxShadow: mode === 'dark' ? '0 12px 40px rgba(96,165,250,0.1)' : '0 12px 40px rgba(37,99,235,0.1)',
                  },
                }}
              >
                <Box sx={{ color: 'primary.main', fontSize: 40, mb: 1.5 }}>{v.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{v.title}</Typography>
                <Typography variant="body2" color="text.secondary">{v.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* ── View Technologies CTA ── */}
        <Box
          sx={(t) => ({
            mt: 10,
            textAlign: 'center',
            py: { xs: 6, md: 8 },
            px: { xs: 3, md: 5 },
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            background: t.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)'
              : 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 50%, #faf5ff 100%)',
            mx: { xs: -3, md: -5 },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: t.palette.mode === 'dark'
                ? 'radial-gradient(circle at 20% 50%, rgba(96,165,250,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(196,181,253,0.06) 0%, transparent 50%)'
                : 'radial-gradient(circle at 20% 50%, rgba(37,99,235,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(124,58,237,0.03) 0%, transparent 50%)',
              pointerEvents: 'none',
            },
          })}
        >
          <Box sx={{ position: 'relative' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '2.25rem' },
                background: mode === 'dark' ? GRADIENT_DARK : GRADIENT,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1.5,
              }}
            >
              {t('techTitle')}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 480, mx: 'auto', lineHeight: 1.8 }}
            >
              {t('techCtaDesc')}
            </Typography>
            <Box
              onClick={() => navigate('/technologies')}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '0.95rem',
                background: mode === 'dark' ? GRADIENT_DARK : GRADIENT,
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: mode === 'dark'
                    ? '0 12px 40px rgba(129,140,248,0.3)'
                    : '0 12px 40px rgba(79,70,229,0.3)',
                },
                '&:active': { transform: 'translateY(0)' },
              }}
            >
              {t('viewTechnologies')}
              <ArrowForwardIcon sx={{ fontSize: 20, transition: 'transform 0.3s ease', '&:hover': { transform: 'translateX(4px)' } }} />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
