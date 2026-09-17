import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Grid, Paper, TextField, Button, Container, Alert, CircularProgress } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { GRADIENT, GRADIENT_DARK } from '../config/constants';
import { useSendContactMessageMutation } from '../stores/contactApi';
import { useTranslation } from '../lib/i18n';

export function ContactPage() {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { t } = useTranslation();

  const contactInfo = [
    { icon: <LocationOnIcon />, label: t('contactAddress'), value: t('contactAddressValue') },
    { icon: <EmailIcon />, label: t('contactEmail'), value: 'hello@VMart.com' },
    { icon: <PhoneIcon />, label: t('contactPhone'), value: '+84 100 000 0000' },
    { icon: <AccessTimeIcon />, label: t('contactHours'), value: t('contactHoursValue') },
  ];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [sendContactMessage, { isLoading }] = useSendContactMessageMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name || !email || !subject || !message) {
      setErrorMessage(t('fillAllFields'));
      return;
    }

    try {
      const res = await sendContactMessage({ name, email, subject, message }).unwrap();
      setSuccessMessage(res.message || t('messageSentSuccess'));
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      console.error('Failed to send contact message:', err);
      setErrorMessage(err?.data?.title || err?.data?.message || t('messageSendFailed'));
    }
  };

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
            {t('contactTitle')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              color: mode === 'dark' ? 'rgba(241,245,249,0.5)' : 'text.secondary',
              maxWidth: 500,
              mx: 'auto',
              lineHeight: 1.8,
            }}
          >
            {t('contactSubtitle')}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {contactInfo.map((info) => (
                <Paper
                  key={info.label}
                  elevation={0}
                  sx={{
                    p: 2.5, display: 'flex', alignItems: 'center', gap: 2,
                    borderRadius: 3, border: '1px solid', borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                  }}
                >
                  <Box sx={{ color: 'primary.main', fontSize: 28, display: 'flex' }}>{info.icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{info.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{info.value}</Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>{t('sendMessage')}</Typography>
              
              {successMessage && (
                <Alert icon={<CheckCircleOutlineIcon fontSize="inherit" />} severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  {successMessage}
                </Alert>
              )}

              {errorMessage && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {errorMessage}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('name')}
                      size="small"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t('email')}
                      type="email"
                      size="small"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('subject')}
                      size="small"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('message')}
                      multiline
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      endIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, py: 1.2, px: 3 }}
                    >
                      {isLoading ? t('sending') : t('sendMessageBtn')}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
