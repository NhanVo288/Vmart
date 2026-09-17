import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import SwapVert from '@mui/icons-material/SwapVert';
import Search from '@mui/icons-material/Search';
import FilterList from '@mui/icons-material/FilterList';
import { useProducts } from '../../../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { ProductSearch } from '../components/ProductSearch';
import { ProductFilters, ActiveFilterChips } from '../components/ProductFilters';
import { ProductPagination } from '../components/ProductPagination';
import { PageSizeSelector } from '../components/PageSizeSelector';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { GRADIENT, GRADIENT_DARK } from '../../../config/constants';
import type { IProductFilters } from '../../../types/product';
import { useTranslation } from '../../../lib/i18n';

export function ProductsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const sortOptions: { label: string; value: IProductFilters }[] = [
    { label: t('sortPriceLowHigh'), value: { orderBy: 'Price', ascending: true } },
    { label: t('sortPriceHighLow'), value: { orderBy: 'Price', ascending: false } },
    { label: t('nameAZ'), value: { orderBy: 'Name', ascending: true } },
    { label: t('nameZA'), value: { orderBy: 'Name', ascending: false } },
    { label: t('brand'), value: { orderBy: 'Brand', ascending: true } },
    { label: t('category'), value: { orderBy: 'Type', ascending: true } },
  ];

  const validFields = ['price', 'name', 'brand', 'type'];
  const rawOrderBy = searchParams.get('orderBy') ?? '';
  const searchTerm = searchParams.get('searchTerm');
  const selectedBrands = [
    ...new Set([
      ...(searchParams.get('brands')?.split(',').filter(Boolean) ?? []),
      ...(searchParams.get('brand')?.split(',').filter(Boolean) ?? []),
    ]),
  ];
  const selectedTypes = [
    ...new Set([
      ...(searchParams.get('types')?.split(',').filter(Boolean) ?? []),
      ...(searchParams.get('type')?.split(',').filter(Boolean) ?? []),
    ]),
  ];
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const pageNumber = parseInt(searchParams.get('pageNumber') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10', 10);
  const validPageSizes = [6, 10, 24, 48];
  const filters: IProductFilters = {
    orderBy: validFields.includes(rawOrderBy.toLowerCase()) ? rawOrderBy : 'Id',
    ascending: searchParams.get('ascending') !== 'false',
    searchTerm: searchTerm ?? undefined,
    brands: selectedBrands.length ? selectedBrands.join(',') : undefined,
    types: selectedTypes.length ? selectedTypes.join(',') : undefined,
    minPrice: minPrice && minPrice !== '0' ? Number(minPrice) : undefined,
    maxPrice: maxPrice && maxPrice !== '0' ? Number(maxPrice) : undefined,
    pageNumber: isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber,
    pageSize: validPageSizes.includes(pageSize) ? pageSize : 10,
  };

  const applySearch = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('searchTerm', value);
    else next.delete('searchTerm');
    next.delete('pageNumber');
    setSearchParams(next, { replace: true });
  };

  const applyBrands = (brands: string[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete('brand');
    if (brands.length) next.set('brands', brands.join(','));
    else next.delete('brands');
    next.delete('pageNumber');
    setSearchParams(next, { replace: true });
  };

  const applyTypes = (types: string[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete('type');
    if (types.length) next.set('types', types.join(','));
    else next.delete('types');
    next.delete('pageNumber');
    setSearchParams(next, { replace: true });
  };

  const applyPrice = (min: string, max: string) => {
    const next = new URLSearchParams(searchParams);
    if (min && min !== '0') next.set('minPrice', min);
    else next.delete('minPrice');
    if (max && max !== '0') next.set('maxPrice', max);
    else next.delete('maxPrice');
    next.delete('pageNumber');
    setSearchParams(next, { replace: true });
  };

  const handlePageChange = useCallback((page: number) => {
    const next = new URLSearchParams(searchParams);
    if (page > 1) next.set('pageNumber', String(page));
    else next.delete('pageNumber');
    setSearchParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, setSearchParams]);

  const handlePageSizeChange = useCallback((size: number) => {
    const next = new URLSearchParams(searchParams);
    if (size !== 10) next.set('pageSize', String(size));
    else next.delete('pageSize');
    next.delete('pageNumber');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let changed = false;
    const next = new URLSearchParams(searchParams);

    // Normalize singular → plural
    const singleType = next.get('type');
    const singleBrand = next.get('brand');
    if (singleType) {
      const existing = next.get('types')?.split(',').filter(Boolean) ?? [];
      next.delete('type');
      const merged = [...new Set([...existing, singleType])];
      next.set('types', merged.join(','));
      changed = true;
    }
    if (singleBrand) {
      const existing = next.get('brands')?.split(',').filter(Boolean) ?? [];
      next.delete('brand');
      const merged = [...new Set([...existing, singleBrand])];
      next.set('brands', merged.join(','));
      changed = true;
    }

    // Remove invalid orderBy
    if (searchParams.has('orderBy') && !validFields.includes(rawOrderBy.toLowerCase())) {
      next.delete('orderBy');
      next.delete('ascending');
      changed = true;
    }

    if (changed) setSearchParams(next, { replace: true });
  }, [searchParams]);

  const { products, pagination, loading, error } = useProducts(filters);
  const isFiltered = !!searchTerm || searchParams.has('orderBy') || selectedBrands.length > 0 || selectedTypes.length > 0 || !!minPrice || !!maxPrice;

  const selectedLabel = sortOptions.find(
    (o) => o.value.orderBy === filters?.orderBy && o.value.ascending === filters?.ascending
  )?.label;

  const clearAll = () => {
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = selectedBrands.length > 0 || selectedTypes.length > 0 || !!minPrice || !!maxPrice;

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      {/* Hero */}
      <Box
        sx={(theme) => ({
          pt: { xs: 6, md: 10 },
          pb: { xs: 5, md: 8 },
          mb: { xs: 3, md: 5 },
          position: 'relative',
          overflow: 'hidden',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)'
              : 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 50%, #faf5ff 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 20% 50%, rgba(96,165,250,0.12) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(129,140,248,0.08) 0%, transparent 60%)'
                : 'radial-gradient(circle at 20% 50%, rgba(37,99,235,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(79,70,229,0.04) 0%, transparent 60%)',
            pointerEvents: 'none',
          },
        })}
      >
        <Container maxWidth="xl" sx={{ position: 'relative' }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
            <Typography
              variant="h3"
              component="h1"
              sx={(theme) => ({
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                background:
                  theme.palette.mode === 'dark' ? GRADIENT_DARK : GRADIENT,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              })}
            >
              {t('discoverProducts')}
            </Typography>
            <Typography
              variant="body1"
              sx={(theme) => ({
                color: theme.palette.mode === 'dark' ? 'rgba(241,245,249,0.5)' : 'text.secondary',
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                maxWidth: 520,
                mx: 'auto',
                mt: 1,
              })}
            >
              {t('browseTechGear')}
            </Typography>
          </Box>

          {/* Search — inside hero */}
          <ProductSearch onSearch={applySearch} initialValue={searchTerm ?? ''} />
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', gap: { xs: 0, md: 2, lg: 3 }, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Sidebar Filters */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, width: { md: 260, lg: 300, xl: 340 }, flexShrink: 0 }}>
            <ProductFilters
              selectedBrands={selectedBrands}
              selectedTypes={selectedTypes}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onBrandsChange={applyBrands}
              onTypesChange={applyTypes}
              onPriceChange={applyPrice}
              onClear={clearAll}
            />
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Toolbar */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: hasActiveFilters ? 1.5 : 4,
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {pagination?.totalCount ?? products.length} {(pagination?.totalCount ?? products.length) === 1 ? t('item') : t('allProducts')}
                </Typography>
                {isFiltered && (
                  <Button size="small" onClick={clearAll} sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.75rem', color: 'text.disabled' }}>
                    {t('clearAll')}
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<FilterList sx={{ fontSize: 18 }} />}
                  onClick={() => setMobileFilterOpen(true)}
                  sx={{ display: { md: 'none' }, borderRadius: 2, textTransform: 'none', fontWeight: 500, color: 'text.secondary' }}
                >
                  {t('filters')}
                </Button>
                <Drawer
                  anchor="bottom"
                  open={mobileFilterOpen}
                  onClose={() => setMobileFilterOpen(false)}
                  slotProps={{
                    paper: {
                      sx: { maxHeight: '85vh', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
                    },
                  }}
                >
                  <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{t('filters')}</Typography>
                    <Button size="small" onClick={() => setMobileFilterOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
                      {t('done')}
                    </Button>
                  </Box>
                  <Box sx={{ px: 2, pb: 3, overflow: 'auto' }}>
                    <ProductFilters
                      selectedBrands={selectedBrands}
                      selectedTypes={selectedTypes}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      onBrandsChange={applyBrands}
                      onTypesChange={applyTypes}
                      onPriceChange={applyPrice}
                      onClear={clearAll}
                    />
                  </Box>
                </Drawer>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<SwapVert sx={{ fontSize: 18 }} />}
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500, color: 'text.secondary' }}
                >
                  {selectedLabel ?? t('sortBy')}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={!!anchorEl}
                  onClose={() => setAnchorEl(null)}
                  slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 200, mt: 0.5 } } }}
                >
                  {sortOptions.map((opt) => (
                    <MenuItem
                      key={opt.label}
                      selected={selectedLabel === opt.label}
                      onClick={() => {
                        const next = new URLSearchParams();
                        if (searchTerm) next.set('searchTerm', searchTerm);
                        next.set('orderBy', opt.value.orderBy);
                        next.set('ascending', String(opt.value.ascending));
                        setSearchParams(next);
                        setAnchorEl(null);
                      }}
                      sx={{ fontSize: '0.9rem' }}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {searchTerm && (
                <Chip
                  icon={<Search sx={{ fontSize: 16 }} />}
                  label={`Search: "${searchTerm}"`}
                  size="small"
                  onDelete={() => applySearch('')}
                  sx={{ borderRadius: 1.5, fontWeight: 500, fontSize: '0.8rem' }}
                />
              )}
              <ActiveFilterChips
                selectedBrands={selectedBrands}
                selectedTypes={selectedTypes}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onBrandsChange={applyBrands}
                onTypesChange={applyTypes}
                onPriceChange={applyPrice}
              />
            </Box>

            {/* Page Size */}
            {pagination && (
              <PageSizeSelector
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
              />
            )}

            {/* Products Grid */}
            {loading ? (
              <Grid container spacing={3}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Box>
                      <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3, mb: 1.5 }} />
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
            ) : products.length === 0 ? (
              <Fade in>
                <Box sx={{ textAlign: 'center', py: 10 }}>
                  <Search sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{t('noProductsFound')}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{t('tryAdjustingFilters')}</Typography>
                  {isFiltered && (
                    <Button variant="outlined" onClick={clearAll} sx={{ borderRadius: 2, textTransform: 'none' }}>{t('clearAllFilters')}</Button>
                  )}
                </Box>
              </Fade>
            ) : (
              <>
                <Grid container spacing={3}>
                  {products.map((product, i) => (
                    <Fade key={product.id} in timeout={200 + i * 40}>
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <ProductCard product={product} />
                  </Grid>
                    </Fade>
                  ))}
                </Grid>

                {pagination && (
                  <ProductPagination
                    pageNumber={pagination.pageNumber}
                    totalPages={pagination.totalPages}
                    totalCount={pagination.totalCount}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
}