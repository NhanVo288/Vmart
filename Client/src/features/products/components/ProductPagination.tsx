import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { useTheme } from '@mui/material/styles';
import { GRADIENT } from '../../../config/constants';

interface ProductPaginationProps {
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function ProductPagination({ pageNumber, totalPages, totalCount: _totalCount, onPageChange }: ProductPaginationProps) {
  const theme = useTheme();

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (pageNumber > 3) pages.push('ellipsis');

      const start = Math.max(2, pageNumber - 1);
      const end = Math.min(totalPages - 1, pageNumber + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (pageNumber < totalPages - 2) pages.push('ellipsis');

      pages.push(totalPages);
    }

    return pages;
  };

  const buttonBase = (active: boolean) => ({
    minWidth: 36,
    height: 36,
    borderRadius: 2,
    fontWeight: 600,
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
    ...(active
      ? {
          background: GRADIENT,
          color: '#fff',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 14px rgba(96,165,250,0.4)'
            : '0 4px 14px rgba(37,99,235,0.35)',
        }
      : {
          color: theme.palette.mode === 'dark' ? '#3f3e3eb3' : 'text.secondary',
          '&:hover': {
            background: theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(37,99,235,0.08)',
            color: theme.palette.mode === 'dark' ? '#f4ececf3' : 'primary.main',
          },
        }),
  });

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        mt: 5,
        mb: 2,
        flexWrap: 'wrap',
      }}
    >
      <Tooltip title="Previous">
        <span>
          <IconButton
            size="small"
            disabled={!pageNumber || pageNumber <= 1}
            onClick={() => onPageChange(pageNumber - 1)}
            sx={{
              ...buttonBase(false),
              mr: 0.5,
              '&.Mui-disabled': {
                opacity: 0.3,
                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'text.disabled',
              },
            }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      {getPageNumbers().map((p, idx) =>
        p === 'ellipsis' ? (
          <Typography
            key={`ellipsis-${idx}`}
            sx={{
              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'text.disabled',
              fontSize: '0.85rem',
              px: 0.5,
              userSelect: 'none',
            }}
          >
            ...
          </Typography>
        ) : (
          <Tooltip key={p} title={`Page ${p}`}>
            <Box
              component="button"
              onClick={() => onPageChange(p)}
              sx={{
                ...buttonBase(p === pageNumber),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                lineHeight: 1,
              }}
            >
              {p}
            </Box>
          </Tooltip>
        )
      )}

      <Tooltip title="Next">
        <span>
          <IconButton
            size="small"
            disabled={!pageNumber || pageNumber >= totalPages}
            onClick={() => onPageChange(pageNumber + 1)}
            sx={{
              ...buttonBase(false),
              ml: 0.5,
              '&.Mui-disabled': {
                opacity: 0.3,
                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'text.disabled',
              },
            }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
