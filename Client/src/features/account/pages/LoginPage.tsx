import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, TextField, Typography, Link, InputAdornment,
  IconButton, Alert, Button, CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useLoginMutation, authApi } from '../../../stores/authApi';
import { setUser } from '../../../stores/authSlice';
import { useAppDispatch } from '../../../stores/hooks';
import { baseApi } from '../../../stores/baseApi';
import { AuthLayout } from '../../../components/ui/AuthLayout';
import { GRADIENT } from '../../../config/constants';

import { useTranslation } from '../../../lib/i18n';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Not a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      await login({ email: data.email, password: data.password }).unwrap();
      const userInfo = await dispatch(
        authApi.endpoints.getUserInfo.initiate(undefined, { forceRefetch: true })
      ).unwrap();
      dispatch(setUser(userInfo));
      dispatch(baseApi.util.invalidateTags(['Basket', 'Favorite']));
      navigate(returnUrl);
    } catch (err: any) {
      const errors = err?.data?.errors;
      setError(errors?.length ? errors.join('. ') : 'Invalid email or password');
    }
  };

  const inputSx = (theme: any) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'transparent',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : undefined,
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : undefined,
      },
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : undefined,
    },
  });

  return (
    <AuthLayout title={t("signInTitle")} subtitle={t("signInSubtitle")}>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          fullWidth
          label={t("email")}
          type="email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message as string}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2, ...inputSx }}
        />

        <TextField
          fullWidth
          label={t("password")}
          type={showPassword ? 'text' : 'password'}
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message as string}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 1, ...inputSx }}
        />

        <Box sx={{ textAlign: 'right', mb: 3 }}>
          <Link
            component={RouterLink}
            to="/forgot-password"
            underline="hover"
            sx={{ fontSize: '0.875rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
          >
            Forgot password?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading || !isValid}
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            background: GRADIENT,
            '&:hover': {
              background: GRADIENT,
              boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
            },
            '&.Mui-disabled': {
              background: GRADIENT,
              opacity: 0.5,
            },
          }}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : t("login")}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
        {t("dontHaveAccount")}{' '}
        <Link
          component={RouterLink}
          to="/register"
          sx={{
            fontWeight: 600,
            background: GRADIENT,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none',
            '&:hover': { opacity: 0.8 },
          }}
        >
          {t("signUpNow")}
        </Link>
      </Typography>
    </AuthLayout>
  );
}
