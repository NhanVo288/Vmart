import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Slider from '@mui/material/Slider';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import { useGetProductFiltersQuery } from '../../../stores/productApi';
import type { IProductFilters } from '../../../types/product';
import { useTranslation } from '../../../lib/i18n';

interface ProductFiltersProps {
  selectedBrands: string[];
  selectedTypes: string[];
  minPrice: string;
  maxPrice: string;
  onBrandsChange: (brands: string[]) => void;
  onTypesChange: (types: string[]) => void;
  onPriceChange: (min: string, max: string) => void;
  onClear: () => void;
}

export function ProductFilters({
  selectedBrands,
  selectedTypes,
  minPrice,
  maxPrice,
  onBrandsChange,
  onTypesChange,
  onPriceChange,
  onClear,
}: ProductFiltersProps) {
  const { t } = useTranslation();
  const filterParams: IProductFilters = {
    orderBy: 'Id',
    ascending: true,
    searchTerm: undefined,
    brands: selectedBrands.length ? selectedBrands.join(',') : undefined,
    types: selectedTypes.length ? selectedTypes.join(',') : undefined,
    minPrice: minPrice && minPrice !== '0' ? Number(minPrice) : undefined,
    maxPrice: maxPrice && maxPrice !== '0' ? Number(maxPrice) : undefined,
  };
  const { data: filterOptions, isLoading } = useGetProductFiltersQuery(filterParams);

  const sliderMin = filterOptions?.minPrice ?? 0;
  const sliderMax = filterOptions?.maxPrice ?? 1000;

  const [priceRange, setPriceRange] = useState<number[]>([
    minPrice ? Number(minPrice) : sliderMin,
    maxPrice ? Number(maxPrice) : sliderMax,
  ]);

  useEffect(() => {
    setPriceRange([
      minPrice ? Number(minPrice) : sliderMin,
      maxPrice ? Number(maxPrice) : sliderMax,
    ]);
  }, [minPrice, maxPrice, sliderMin, sliderMax]);

  const handleToggleBrand = (brand: string) => {
    const next = selectedBrands.some((b) => b.toLowerCase() === brand.toLowerCase())
      ? selectedBrands.filter((b) => b.toLowerCase() !== brand.toLowerCase())
      : [...selectedBrands, brand];
    onBrandsChange(next);
  };

  const handleToggleType = (type: string) => {
    const next = selectedTypes.some((t) => t.toLowerCase() === type.toLowerCase())
      ? selectedTypes.filter((t) => t.toLowerCase() !== type.toLowerCase())
      : [...selectedTypes, type];
    onTypesChange(next);
  };

  const hasActiveFilters = selectedBrands.length > 0 || selectedTypes.length > 0 || !!minPrice || !!maxPrice;

  return (
    <Paper
      variant="outlined"
      sx={{
        width: { xs: '100%', md: 260, lg: 300, xl: 340 },
        flexShrink: 0,
        borderRadius: 3,
        overflow: 'hidden',
        alignSelf: 'flex-start',
        position: { md: 'sticky' },
        top: { md: 24 },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, pt: 2, pb: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{t('filters')}</Typography>
        {hasActiveFilters && (
          <Typography
            onClick={onClear}
            variant="caption"
            sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
          >
            {t('resetFilters')}
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Brand Section */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary', mb: 1 }}>
          {t('filterByBrand')}
        </Typography>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="text" width={`${60 + i * 10}%`} height={28} sx={{ mb: 0.5 }} />
          ))
        ) : filterOptions?.brands.length === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.8rem' }}>No brands available</Typography>
        ) : (
          <Box sx={{ maxHeight: 180, overflowY: 'auto', pr: 0.5 }}>
            {filterOptions?.brands.map((brand) => (
              <FormControlLabel
                key={brand}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedBrands.some((b) => b.toLowerCase() === brand.toLowerCase())}
                    onChange={() => handleToggleBrand(brand)}
                    sx={{ '&.Mui-checked': { color: 'primary.main' }, py: 0.25 }}
                  />
                }
                label={<Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{brand}</Typography>}
                sx={{ display: 'flex', mx: 0, '& .MuiTypography-root': { flexGrow: 1 } }}
              />
            ))}
          </Box>
        )}
      </Box>

      <Divider />

      {/* Type Section */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary', mb: 1 }}>
          {t('filterByType')}
        </Typography>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="text" width={`${50 + i * 10}%`} height={28} sx={{ mb: 0.5 }} />
          ))
        ) : filterOptions?.types.length === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.8rem' }}>No types available</Typography>
        ) : (
          <Box sx={{ maxHeight: 180, overflowY: 'auto', pr: 0.5 }}>
            {filterOptions?.types.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedTypes.some((t) => t.toLowerCase() === type.toLowerCase())}
                    onChange={() => handleToggleType(type)}
                    sx={{ '&.Mui-checked': { color: 'primary.main' }, py: 0.25 }}
                  />
                }
                label={<Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{type}</Typography>}
                sx={{ display: 'flex', mx: 0, '& .MuiTypography-root': { flexGrow: 1 } }}
              />
            ))}
          </Box>
        )}
      </Box>

      <Divider />

      {/* Price Range */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'text.secondary', mb: 2 }}>
          {t('filterByPrice')}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.9rem' }}>
            VND{priceRange[0]}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.9rem' }}>
            VND{priceRange[1]}
          </Typography>
        </Box>
        <Slider
          value={priceRange}
          onChange={(_, newValue) => setPriceRange(newValue as number[])}
          onChangeCommitted={(_, newValue) => onPriceChange(String((newValue as number[])[0]), String((newValue as number[])[1]))}
          min={sliderMin}
          max={sliderMax}
          disableSwap
          sx={{
            color: 'primary.main',
            py: 0,
            '& .MuiSlider-thumb': {
              width: 20,
              height: 20,
              '&::before': { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
              '&:hover, &.Mui-active': { boxShadow: '0 0 0 8px rgba(99,102,241,0.12)' },
            },
            '& .MuiSlider-track': { height: 6, borderRadius: 3, border: 'none' },
            '& .MuiSlider-rail': { height: 6, borderRadius: 3, opacity: 0.25 },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
            VND{sliderMin}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
            VND{sliderMax}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export function ActiveFilterChips({
  selectedBrands,
  selectedTypes,
  minPrice,
  maxPrice,
  onBrandsChange,
  onTypesChange,
  onPriceChange,
}: {
  selectedBrands: string[];
  selectedTypes: string[];
  minPrice: string;
  maxPrice: string;
  onBrandsChange: (brands: string[]) => void;
  onTypesChange: (types: string[]) => void;
  onPriceChange: (min: string, max: string) => void;
}) {
  if (!selectedBrands.length && !selectedTypes.length && !minPrice && !maxPrice) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
      {selectedBrands.map((brand) => (
        <Chip
          key={brand}
          label={brand}
          size="small"
          onDelete={() => onBrandsChange(selectedBrands.filter((b) => b.toLowerCase() !== brand.toLowerCase()))}
          sx={{ borderRadius: 1.5, fontWeight: 500, fontSize: '0.8rem' }}
        />
      ))}
      {selectedTypes.map((type) => (
        <Chip
          key={type}
          label={type}
          size="small"
          onDelete={() => onTypesChange(selectedTypes.filter((t) => t.toLowerCase() !== type.toLowerCase()))}
          sx={{ borderRadius: 1.5, fontWeight: 500, fontSize: '0.8rem' }}
        />
      ))}
      {(minPrice || maxPrice) && (
        <Chip
          label={`Price: ${minPrice ? `VND${minPrice}` : 'VND0'} — ${maxPrice ? `VND${maxPrice}` : '∞'}`}
          size="small"
          onDelete={() => onPriceChange('', '')}
          sx={{ borderRadius: 1.5, fontWeight: 500, fontSize: '0.8rem' }}
        />
      )}
    </Box>
  );
}
