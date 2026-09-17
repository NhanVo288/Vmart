import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Skeleton,
} from "@mui/material";
import { PageLayout } from "../../../components/layout/PageLayout";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { useGetOrdersQuery } from "../../../stores/orderApi";
import { GRADIENT, formatPrice } from "../../../config/constants";
import { ProductPagination } from "../../products/components/ProductPagination";
import { PageSizeSelector } from "../../products/components/PageSizeSelector";
import type { IOrderFilters } from "../../../types/order";
import { useTranslation } from "../../../lib/i18n";

const VALID_PAGE_SIZES = [6, 10, 24, 48];
const ORDER_STATUSES = ["", "Pending", "PaymentReceived", "PaymentFailed", "PaymentMismatch", "Shipped", "Delivered", "Cancelled"];

const statusColors: Record<
  string,
  "warning" | "info" | "error" | "success" | "default"
> = {
  Pending: "warning",
  PaymentReceived: "info",
  PaymentFailed: "error",
  Shipped: "info",
  Delivered: "success",
  Cancelled: "error",
};

export function OrdersPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const sortOptions: { label: string; value: IOrderFilters }[] = [
    { label: t('newestFirst'), value: { orderBy: "OrderDate", ascending: false } },
    { label: t('oldestFirst'), value: { orderBy: "OrderDate", ascending: true } },
    { label: t('totalHighLow'), value: { orderBy: "Total", ascending: false } },
    { label: t('totalLowHigh'), value: { orderBy: "Total", ascending: true } },
    { label: t('status'), value: { orderBy: "Status", ascending: true } },
  ];

  const pageNumber = parseInt(searchParams.get("pageNumber") ?? "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10);
  const statusFilter = searchParams.get("status") ?? "";
  const rawOrderBy = searchParams.get("orderBy") ?? "";

  const validOrderByFields = ["orderdate", "total", "status"];
  const filters: IOrderFilters = {
    status: statusFilter || undefined,
    orderBy: validOrderByFields.includes(rawOrderBy.toLowerCase()) ? rawOrderBy : "OrderDate",
    ascending: searchParams.get("ascending") !== "true" ? false : true,
    pageNumber: isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber,
    pageSize: VALID_PAGE_SIZES.includes(pageSize) ? pageSize : 10,
  };

  const { data: result, isLoading } = useGetOrdersQuery(filters);

  const handlePageChange = useCallback((page: number) => {
    const next = new URLSearchParams(searchParams);
    if (page > 1) next.set("pageNumber", String(page));
    else next.delete("pageNumber");
    setSearchParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams, setSearchParams]);

  const handlePageSizeChange = useCallback((size: number) => {
    const next = new URLSearchParams(searchParams);
    if (size !== 10) next.set("pageSize", String(size));
    else next.delete("pageSize");
    next.delete("pageNumber");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleStatusChange = (status: string) => {
    const next = new URLSearchParams(searchParams);
    if (status) next.set("status", status);
    else next.delete("status");
    next.delete("pageNumber");
    setSearchParams(next, { replace: true });
  };

  const handleSortChange = (opt: IOrderFilters) => {
    const next = new URLSearchParams(searchParams);
    if (statusFilter) next.set("status", statusFilter);
    if (opt.orderBy && opt.orderBy !== "OrderDate") next.set("orderBy", opt.orderBy!);
    else next.delete("orderBy");
    next.set("ascending", String(opt.ascending));
    next.delete("pageNumber");
    setSearchParams(next, { replace: true });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Skeleton variant="circular" width={52} height={52} />
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      </PageLayout>
    );
  }

  const items = result?.items ?? [];
  const totalCount = result?.totalCount ?? 0;

  if (totalCount === 0 && !statusFilter) {
    return (
      <PageLayout maxWidth="md">
        <Box sx={{ textAlign: "center" }}>
          <ReceiptLongIcon sx={{ fontSize: 72, color: "text.disabled", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {t('noOrdersYet')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('startShoppingOrders')}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            {t('browseProducts')}
          </Button>
        </Box>
      </PageLayout>
    );
  }

  const selectedSortLabel = sortOptions.find(
    (o) => o.value.orderBy === filters.orderBy && o.value.ascending === filters.ascending
  )?.label;

  return (
    <PageLayout>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box
          sx={{
            bgcolor: "background.default",
            borderRadius: "50%",
            p: 1.2,
            display: "flex",
            boxShadow: "0 4px 20px rgba(13,33,55,0.2)",
          }}
        >
          <ReceiptLongIcon sx={{ color: "primary.main", fontSize: 28 }} />
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: GRADIENT,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t('myOrders')}
        </Typography>
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
          {totalCount} {totalCount === 1 ? t('orderSingle') : t('orders')}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel sx={{ fontSize: "0.85rem" }}>{t('status')}</InputLabel>
            <Select
              value={statusFilter}
              label={t('status')}
              onChange={(e) => handleStatusChange(e.target.value)}
              sx={{ borderRadius: 2, fontSize: "0.85rem" }}
            >
              <MenuItem value="">{t('all')}</MenuItem>
              {ORDER_STATUSES.filter(Boolean).map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel sx={{ fontSize: "0.85rem" }}>{t('sort')}</InputLabel>
            <Select
              value={selectedSortLabel ?? ""}
              label={t('sort')}
              onChange={(e) => {
                const opt = sortOptions.find((o) => o.label === e.target.value);
                if (opt) handleSortChange(opt.value);
              }}
              sx={{ borderRadius: 2, fontSize: "0.85rem" }}
            >
              {sortOptions.map((opt) => (
                <MenuItem key={opt.label} value={opt.label}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {totalCount === 0 && statusFilter && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="body1" color="text.secondary">
            {t('noOrdersWithStatus')} "{statusFilter}"
          </Typography>
          <Button size="small" onClick={() => handleStatusChange("")} sx={{ mt: 1, textTransform: "none", borderRadius: 2 }}>
            {t('clearFilter')}
          </Button>
        </Box>
      )}

      {totalCount > 0 && (
        <>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{t('order')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('date')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('total')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('status')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('items')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((order) => (
                  <TableRow
                    key={order.id}
                    hover
                    sx={{ cursor: "pointer", "&:last-child td": { border: 0 } }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, fontFamily: "monospace" }}
                      >
                        #{order.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatPrice(order.total)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        size="small"
                        color={statusColors[order.status] ?? "default"}
                        sx={{ fontWeight: 600, borderRadius: 1.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <ShoppingBagIcon
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {order.orderItems.length}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <PageSizeSelector
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />

          {result && (
            <ProductPagination
              pageNumber={result.pageNumber}
              totalPages={result.totalPages}
              totalCount={result.totalCount}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </PageLayout>
  );
}

