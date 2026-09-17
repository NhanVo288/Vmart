import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { GRADIENT } from '../../../config/constants';
import { useTranslation } from '../../../lib/i18n';

const PAGE_SIZES = [6, 10, 24, 48];

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function PageSizeSelector({ pageSize, onPageSizeChange }: PageSizeSelectorProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'center', sm: 'flex-end' },
        gap: { xs: 0.5, sm: 0.75 },
        py: 1.5,
        px: { xs: 1, sm: 0 },
        flexWrap: 'wrap',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'text.disabled',
          fontWeight: 400,
          fontSize: { xs: '0.7rem', sm: '0.75rem' },
          userSelect: 'none',
          mr: { xs: 0.5, sm: 1 },
        }}
      >
        {t('showPerPage')}
      </Typography>

      {PAGE_SIZES.map((size) => {
        const active = size === pageSize;
        return (
          <Box
            key={size}
            component="button"
            onClick={() => onPageSizeChange(size)}
            sx={{
              minWidth: { xs: 36, sm: 44 },
              height: { xs: 30, sm: 34 },
              px: { xs: 1, sm: 1.5 },
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              lineHeight: 1,
              fontWeight: 700,
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              transition: 'all 0.2s ease',
              ...(active
                ? {
                    background: GRADIENT,
                    color: '#fff',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 2px 10px rgba(96,165,250,0.35)'
                      : '0 2px 10px rgba(37,99,235,0.3)',
                  }
                : {
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(37,99,235,0.06)',
                    color: theme.palette.mode === 'dark' ? 'rgba(241,245,249,0.5)' : 'text.secondary',
                    '&:hover': {
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.12)'
                        : 'rgba(37,99,235,0.14)',
                      color: theme.palette.mode === 'dark' ? '#fff' : 'primary.main',
                    },
                  }),
            }}
          >
            {size}
          </Box>
        );
      })}
    </Box>
  );
}
