import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, TextField, Typography, Link,
  InputAdornment, IconButton, Alert, Button, CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRegisterMutation, authApi } from '../../../stores/authApi';
import { setCredentials, setUser } from '../../../stores/authSlice';
import { useAppDispatch } from '../../../stores/hooks';
import { baseApi } from '../../../stores/baseApi';
import { AuthLayout } from '../../../components/ui/AuthLayout';
import { GRADIENT } from '../../../config/constants';
import { useTranslation } from '../../../lib/i18n';

const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Not a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and a number'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerApi, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      const result = await registerApi({ email: data.email, password: data.password }).unwrap();
      if (result.isSuccess && result.token) {
        dispatch(
          setCredentials({
            token: result.token,
            user: { email: result.email ?? data.email, userName: result.email ?? data.email, roles: [] },
          })
        );
        try {
          const userInfo = await dispatch(
            authApi.endpoints.getUserInfo.initiate(undefined, { forceRefetch: true })
          ).unwrap();
          dispatch(setUser(userInfo));
          dispatch(baseApi.util.invalidateTags(['Basket', 'Favorite']));
        } catch { /* best-effort */ }
        navigate('/');
      } else if (result.errors?.length) {
        setError(result.errors.join('. '));
      }
    } catch (err: any) {
      const serverErrors = err?.data?.errors;
      if (serverErrors) {
        const messages = Object.values(serverErrors).flat().join('. ');
        setError(messages || 'Registration failed');
      } else {
        setError(err?.data?.title || 'Registration failed');
      }
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
    <AuthLayout title={t('signUpTitle')} subtitle={t('signUpSubtitle')}>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          fullWidth
          label={t('email')}
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
          label={t('password')}
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
          sx={{ mb: 2, ...inputSx }}
        />

        <TextField
          fullWidth
          label={t('confirmPassword')}
          type={showPassword ? 'text' : 'password'}
          {...register('confirmPassword')}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message as string}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 3, ...inputSx }}
        />

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
          {isLoading ? <CircularProgress size={20} color="inherit" /> : t('register')}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
        {t('alreadyHaveAccount')}{' '}
        <Link
          component={RouterLink}
          to="/login"
          sx={{
            fontWeight: 600,
            background: GRADIENT,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none',
            '&:hover': { opacity: 0.8 },
          }}
        >
          {t('signInNow')}
        </Link>
      </Typography>
    </AuthLayout>
  );
}
