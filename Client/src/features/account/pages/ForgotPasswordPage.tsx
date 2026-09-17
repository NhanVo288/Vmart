import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, TextField, Typography, Link, InputAdornment,
  Button, CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import { useForgotPasswordMutation } from '../../../stores/authApi';
import { AuthLayout } from '../../../components/ui/AuthLayout';
import { GRADIENT } from '../../../config/constants';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Not a valid email address'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: ForgotForm) => {
    try {
      await forgotPassword({ email: data.email }).unwrap();
      setSubmittedEmail(data.email);
      setSuccess(true);
    } catch {
      setSubmittedEmail(data.email);
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check Your Email" subtitle="We've sent a password reset link">
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CheckCircleRounded sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            If an account exists with
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
            {submittedEmail}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            you'll receive a password reset link shortly. Please check your inbox and spam folder.
          </Typography>
          <Button
            component={RouterLink}
            to="/login"
            startIcon={<ArrowBack />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              background: GRADIENT,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Back to Sign In
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot Password?" subtitle="Enter your email to reset your password">
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          fullWidth
          label="Email"
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
          sx={{ mb: 3 }}
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
          {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Send Reset Link'}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
        Remember your password?{' '}
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
          Sign in
        </Link>
      </Typography>
    </AuthLayout>
  );
}
