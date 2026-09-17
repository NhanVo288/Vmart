import { useState } from "react";
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
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { useGetVendorOrdersQuery } from "../../../stores/vendorApi";
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

export function VendorOrdersPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetVendorOrdersQuery({
    pageNumber: page + 1,
    pageSize: rowsPerPage,
    searchTerm: search || null,
    orderBy: "orderDate",
    ascending: false,
  });

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
          Orders containing your products
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
                    My Items Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Items
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
                        {order.buyerEmail || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(order.orderDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        VND{order.vendorSubtotal.toFixed(2)}
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
                      <Typography variant="body2" color="text.secondary">
                        {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}
                      </Typography>
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
