import { useState, useEffect } from 'react';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, TextField, Typography, Link, InputAdornment,
  Alert, Button, CircularProgress,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import { useResetPasswordMutation } from '../../../stores/authApi';
import { AuthLayout } from '../../../components/ui/AuthLayout';
import { GRADIENT } from '../../../config/constants';

const resetSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetForm = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  useEffect(() => {
    if (!email || !token) {
      setError('Invalid or missing reset link. Please request a new one.');
    }
  }, [email, token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: ResetForm) => {
    setError('');
    if (!email || !token) {
      setError('Invalid or missing reset link.');
      return;
    }

    try {
      await resetPassword({ email, token, newPassword: data.newPassword }).unwrap();
      setSuccess(true);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to reset password. The link may have expired.');
    }
  };

  if (success) {
    return (
      <AuthLayout title="Password Reset!" subtitle="Your password has been updated successfully">
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CheckCircleRounded sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You can now sign in with your new password.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
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
            }}
          >
            Sign In
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password below">
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          fullWidth
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          {...register('newPassword')}
          error={!!errors.newPassword}
          helperText={errors.newPassword?.message as string}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
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
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" size="small">
                    {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading || !isValid || !email || !token}
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
          {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Reset Password'}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
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
          Back to Sign In
        </Link>
      </Typography>
    </AuthLayout>
  );
}
