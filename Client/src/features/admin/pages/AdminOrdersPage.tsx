import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useGetAdminOrdersQuery, useUpdateOrderStatusMutation } from "../../../stores/adminApi";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";

const statusColors: Record<string, "warning" | "info" | "error" | "primary" | "success" | "default"> = {
  Pending: "warning",
  PaymentReceived: "info",
  PaymentFailed: "error",
  PaymentMismatch: "error",
  Shipped: "primary",
  Delivered: "success",
  Cancelled: "default",
};

const statusTransitions: Record<string, string[]> = {
  Pending: ["PaymentReceived", "PaymentFailed", "Cancelled"],
  PaymentReceived: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
};

export function AdminOrdersPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<{ id: number; status: string } | null>(null);

  const { data, isLoading } = useGetAdminOrdersQuery({
    pageNumber: page + 1,
    pageSize: rowsPerPage,
    searchTerm: search || null,
    orderBy: "orderDate",
    ascending: false,
  });

  const [updateStatus] = useUpdateOrderStatusMutation();

  const handleStatusChange = useCallback(
    async (status: string) => {
      if (!selectedOrder) return;
      try {
        await updateStatus({ id: selectedOrder.id, status }).unwrap();
      } catch {}
      setAnchorEl(null);
      setSelectedOrder(null);
    },
    [selectedOrder, updateStatus]
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage customer orders and update their status
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <TextField
            placeholder="Search by order ID or buyer email..."
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              maxWidth: 360,
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />
        </Box>

        {isLoading ? (
          <LoadingSkeleton variant="table" />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Buyer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.items.map((order) => (
                  <TableRow
                    key={order.id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                        #{order.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                        {order.buyerEmail || `Guest (${order.buyerId.substring(0, 8)}...)`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(order.orderDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        VND{order.total.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={order.status}
                        size="small"
                        color={statusColors[order.status] ?? "default"}
                        variant="outlined"
                        sx={{ fontWeight: 600, minWidth: 100 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setSelectedOrder({ id: order.id, status: order.status });
                          setAnchorEl(e.currentTarget);
                        }}
                        disabled={!statusTransitions[order.status]}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={!!anchorEl && selectedOrder?.id === order.id}
                        onClose={() => {
                          setAnchorEl(null);
                          setSelectedOrder(null);
                        }}
                        slotProps={{
                          paper: {
                            sx: { borderRadius: 2, minWidth: 160 },
                          },
                        }}
                      >
                        <Box sx={{ px: 2, py: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Update status
                          </Typography>
                        </Box>
                        {selectedOrder &&
                          (statusTransitions[selectedOrder.status] ?? []).map((s) => (
                            <MenuItem
                              key={s}
                              onClick={() => handleStatusChange(s)}
                              sx={{ borderRadius: 1, mx: 0.5 }}
                            >
                              {s}
                            </MenuItem>
                          ))}
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No orders found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          component="div"
          count={data?.totalCount ?? 0}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Box>
  );
}
