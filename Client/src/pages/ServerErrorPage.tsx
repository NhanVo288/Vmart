import { useLocation, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Home from '@mui/icons-material/Home';
import { GRADIENT } from '../config/constants';
import { useTranslation } from '../lib/i18n';

export function ServerErrorPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const error = location.state?.error as Record<string, unknown> | undefined;

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '6rem', md: '10rem' },
            fontWeight: 900,
            lineHeight: 1,
            background: GRADIENT,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          500
        </Typography>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {t('serverError')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, lineHeight: 1.7 }}>
          {t('serverErrorDesc')}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: 1, maxWidth: 600, borderRadius: 2, textAlign: 'left', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(error, null, 2)}
          </Alert>
        )}
        <Button variant="contained" size="large" startIcon={<Home />} onClick={() => navigate('/')} sx={{ mt: 2, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
          {t('backToHome')}
        </Button>
      </Box>
    </Container>
  );
}
