import type { ReactNode } from 'react';
import { Box, Container } from '@mui/material';

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export function PageLayout({ children, maxWidth = 'xl' }: PageLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth={maxWidth}>
        {children}
      </Container>
    </Box>
  );
}
