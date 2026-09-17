import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

type SkeletonVariant = 'card' | 'detail' | 'table' | 'cart' | 'dashboard' | 'profile' | 'order-detail' | 'checkout' | 'form';

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
}

function CardSkeletons({ count }: { count: number }) {
  return (
    <Container sx={{ py: 4 }}>
      <Skeleton variant="text" sx={{ fontSize: '3rem', width: 300, mx: 'auto', mb: 4 }} />
      <Grid container spacing={3}>
        {Array.from({ length: count }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
            <Box sx={{ pt: 2, px: 1 }}>
              <Skeleton variant="text" sx={{ fontSize: '1.2rem', width: '80%' }} />
              <Skeleton variant="text" sx={{ fontSize: '0.9rem' }} />
              <Skeleton variant="text" sx={{ fontSize: '0.9rem', width: '60%' }} />
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Skeleton variant="rounded" width={60} height={24} />
                <Skeleton variant="rounded" width={60} height={24} />
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

function DetailSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Skeleton variant="text" sx={{ fontSize: '1rem', width: 80, mb: 3 }} />
      <Grid container spacing={{ xs: 2, md: 5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" sx={{ height: { xs: 300, md: 500 }, borderRadius: 3 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Stack direction="row" spacing={1}>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={80} height={24} />
            </Stack>
            <Skeleton variant="text" sx={{ fontSize: '2.5rem', width: '90%' }} />
            <Skeleton variant="text" sx={{ fontSize: '2rem', width: '40%' }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem', width: '70%' }} />
            <Skeleton variant="rounded" height={40} width={200} sx={{ borderRadius: 2 }} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

function TableSkeleton({ count = 8 }: { count: number }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Skeleton variant="rounded" height={40} sx={{ flex: 1, borderRadius: 2 }} />
        <Skeleton variant="rounded" width={120} height={40} sx={{ borderRadius: 2 }} />
      </Box>
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', px: 2, py: 1.5, bgcolor: 'action.hover' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="text" sx={{ flex: 1, mx: 0.5, fontSize: '0.8rem' }} />
          ))}
        </Box>
        {Array.from({ length: count }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Skeleton variant="rounded" width={32} height={32} sx={{ mr: 1.5, borderRadius: 1 }} />
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} variant="text" sx={{ flex: 1, mx: 0.5, fontSize: '0.9rem' }} />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function CartSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Skeleton variant="text" sx={{ fontSize: '2rem', width: 150, mb: 3 }} />
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', gap: 2 }}>
                <Skeleton variant="rounded" width={100} height={100} sx={{ borderRadius: 2, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" sx={{ fontSize: '1.1rem', width: '70%' }} />
                  <Skeleton variant="text" sx={{ fontSize: '0.85rem', width: '40%' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Skeleton variant="rounded" width={100} height={32} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="text" sx={{ fontSize: '1.2rem', width: 60 }} />
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
            <Skeleton variant="text" sx={{ fontSize: '1.2rem', width: 100, mb: 2 }} />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="text" sx={{ fontSize: '0.9rem', width: `${80 - i * 15}%`, my: 0.5 }} />
            ))}
            <Skeleton variant="rounded" height={44} sx={{ borderRadius: 2, mt: 2 }} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

function DashboardSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: 200, mb: 0.5 }} />
      <Skeleton variant="text" sx={{ fontSize: '0.9rem', width: 300, mb: 3 }} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, lg: 3 }}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 1.5 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" sx={{ fontSize: '1.15rem', width: '60%' }} />
                <Skeleton variant="text" sx={{ fontSize: '0.75rem', width: '80%' }} />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Skeleton variant="text" sx={{ fontSize: '0.9rem', width: 120 }} />
        </Box>
        {Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 1.5, borderBottom: i < 4 ? '1px solid' : 'none', borderColor: 'divider' }}>
            <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" sx={{ fontSize: '0.85rem', width: '30%' }} />
              <Skeleton variant="text" sx={{ fontSize: '0.7rem', width: '50%' }} />
            </Box>
            <Skeleton variant="rounded" width={70} height={22} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

function ProfileSkeleton() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: 150, mb: 3 }} />
      <Stack spacing={3}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Skeleton variant="text" sx={{ fontSize: '1rem', width: 120, mb: 2 }} />
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} variant="text" sx={{ fontSize: '0.9rem', width: `${70 - j * 15}%`, my: 0.5 }} />
            ))}
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}

function OrderDetailSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Skeleton variant="text" sx={{ fontSize: '1rem', width: 80, mb: 1 }} />
      <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: 200, mb: 3 }} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Skeleton variant="text" sx={{ fontSize: '1rem', width: 120, mb: 2 }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="text" sx={{ fontSize: '0.85rem', width: `${60 - i * 10}%` }} />
            ))}
          </Paper>
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Skeleton variant="text" sx={{ fontSize: '1rem', width: 100 }} />
            </Box>
            {Array.from({ length: 2 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, px: 3, py: 2, borderBottom: i < 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Skeleton variant="rounded" width={64} height={64} sx={{ borderRadius: 2, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" sx={{ fontSize: '0.95rem', width: '60%' }} />
                  <Skeleton variant="text" sx={{ fontSize: '0.8rem', width: '40%' }} />
                  <Skeleton variant="text" sx={{ fontSize: '0.85rem', width: '20%' }} />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Skeleton variant="text" sx={{ fontSize: '1rem', width: 100, mb: 2 }} />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="text" sx={{ fontSize: '0.85rem', width: `${70 - i * 15}%`, my: 0.5 }} />
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

function CheckoutSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: 150, mb: 3 }} />
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Skeleton variant="text" sx={{ fontSize: '1rem', width: 140, mb: 2 }} />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={40} sx={{ borderRadius: 1, mb: 1.5 }} />
            ))}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Skeleton variant="text" sx={{ fontSize: '1rem', width: 100, mb: 2 }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="text" sx={{ fontSize: '0.85rem', width: `${75 - i * 12}%`, my: 0.5 }} />
            ))}
            <Skeleton variant="rounded" height={44} sx={{ borderRadius: 2, mt: 2 }} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

function FormSkeleton() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: 180, mb: 3 }} />
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={40} sx={{ borderRadius: 1, mb: 1.5 }} />
            ))}
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
          <Skeleton variant="rounded" width={100} height={40} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" width={120} height={40} sx={{ borderRadius: 2 }} />
        </Box>
      </Paper>
    </Container>
  );
}

export function LoadingSkeleton({ variant = 'card', count = 8 }: LoadingSkeletonProps) {
  switch (variant) {
    case 'detail':
      return <DetailSkeleton />;
    case 'table':
      return <TableSkeleton count={count} />;
    case 'cart':
      return <CartSkeleton />;
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'profile':
      return <ProfileSkeleton />;
    case 'order-detail':
      return <OrderDetailSkeleton />;
    case 'checkout':
      return <CheckoutSkeleton />;
    case 'form':
      return <FormSkeleton />;
    default:
      return <CardSkeletons count={count} />;
  }
}
