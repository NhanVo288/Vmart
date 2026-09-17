import { type ReactNode } from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { GRADIENT, GRADIENT_DARK } from '../../config/constants';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(135deg, #0a0f1a 0%, #0f1a25 50%, #080f1a 100%)'
          : 'linear-gradient(135deg, #eef2f7 0%, #e0e8f0 50%, #f0f4f8 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(27,107,138,0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(13,33,55,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(77,184,209,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(27,107,138,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Card
        sx={{
          width: '100%',
          maxWidth: 440,
          mx: 2,
          borderRadius: 4,
          backdropFilter: 'blur(20px)',
          bgcolor: isDark ? 'rgba(15,20,30,0.85)' : 'rgba(255,255,255,0.85)',
          boxShadow: isDark
            ? '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)'
            : '0 8px 40px rgba(13,33,55,0.1), 0 0 0 1px rgba(13,33,55,0.06)',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            mt: -3,
            mb: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: 'background.default',
              borderRadius: '50%',
              p: 1.2,
              display: 'flex',
              boxShadow: isDark
                ? '0 4px 20px rgba(77,184,209,0.25)'
                : '0 4px 20px rgba(13,33,55,0.2)',
            }}
          >
            <Box
              component="img"
              src="/favicon.jpg"
              alt="VMart"
              sx={{ width: 32, height: 32, borderRadius: 1 }}
            />
          </Box>
        </Box>

        <CardContent sx={{ px: 4, pb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              background: isDark ? GRADIENT_DARK : GRADIENT,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 3.5 }}
          >
            {subtitle}
          </Typography>

          {children}
        </CardContent>
      </Card>
    </Box>
  );
}
