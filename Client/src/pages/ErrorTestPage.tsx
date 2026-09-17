import { toast } from 'react-toastify';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import BugReport from '@mui/icons-material/BugReport';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import {
  useGetNotFoundQuery,
  useGetBadRequestQuery,
  useGetUnauthorizedQuery,
  useGetValidationErrorQuery,
  useGetServerErrorQuery,
} from '../stores/errorApi';
import { GRADIENT } from '../config/constants';

interface ErrorResult {
  label: string;
  status: number;
  error: FetchBaseQueryError | SerializedError | undefined;
  isFetching: boolean;
}

function isFetchBaseQueryError(e: unknown): e is FetchBaseQueryError {
  return typeof e === 'object' && e !== null && 'status' in e;
}

function formatError(error: FetchBaseQueryError | SerializedError): string {
  if (isFetchBaseQueryError(error)) {
    if (typeof error.status === 'number') {
      const data = error.data;
      if (typeof data === 'object' && data !== null && 'title' in data) {
        return String((data as Record<string, unknown>).title);
      }
      return JSON.stringify(data);
    }
    return error.error;
  }
  return error.message ?? 'An unexpected error occurred';
}

const statusColors: Record<number, string> = {
  404: '#ff9800',
  400: '#f44336',
  401: '#9c27b0',
  500: '#d32f2f',
};

function ErrorCard({ label, status, error, isFetching }: ErrorResult) {
  return (
    <Card
      onClick={() => {
        if (error) toast.error(formatError(error));
      }}
      sx={{
        cursor: error ? 'pointer' : 'default',
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <Box
        sx={{
          bgcolor: statusColors[status],
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <BugReport sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 20 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff' }}>
          {label}
        </Typography>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {isFetching ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">Fetching...</Typography>
          </Box>
        ) : error ? (
          <Typography
            variant="body2"
            component="pre"
            sx={{
              fontFamily: '"Cascadia Code", "Fira Code", "Consolas", monospace',
              fontSize: '0.8rem',
              lineHeight: 1.6,
              color: 'text.secondary',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              m: 0,
            }}
          >
            {formatError(error)}
          </Typography>
        ) : (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            No error — unexpected success!
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export function ErrorTestPage() {
  const nf = useGetNotFoundQuery();
  const br = useGetBadRequestQuery();
  const ua = useGetUnauthorizedQuery();
  const ve = useGetValidationErrorQuery();
  const se = useGetServerErrorQuery();

  const errors: ErrorResult[] = [
    { label: 'Not Found', status: 404, error: nf.error, isFetching: nf.isFetching },
    { label: 'Bad Request', status: 400, error: br.error, isFetching: br.isFetching },
    { label: 'Unauthorized', status: 401, error: ua.error, isFetching: ua.isFetching },
    { label: 'Validation Error', status: 400, error: ve.error, isFetching: ve.isFetching },
    { label: 'Server Error', status: 500, error: se.error, isFetching: se.isFetching },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 800,
            background: GRADIENT,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Error Testing
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', lineHeight: 1.7 }}>
          Each card fires a request to the corresponding BuggyController endpoint to verify error handling.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {errors.map((err) => (
          <Grid key={err.label} size={{ xs: 12, sm: 6, lg: 4 }}>
            <ErrorCard {...err} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}