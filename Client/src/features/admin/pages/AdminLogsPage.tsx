import { useState } from "react";
import { useGetLogsQuery, useGetLogStatsQuery } from "../../../stores/adminApi";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RefreshIcon from "@mui/icons-material/Refresh";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { ProductPagination } from "../../products/components/ProductPagination";

const levelOptions = [
  { value: "", label: "All Levels" },
  { value: "information", label: "Information" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
  { value: "debug", label: "Debug" },
  { value: "fatal", label: "Fatal" },
];

const levelColors: Record<string, "info" | "warning" | "error" | "success" | "default" | "secondary"> = {
  information: "info",
  warning: "warning",
  error: "error",
  debug: "secondary",
  fatal: "error",
  trace: "default",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AdminLogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [level, setLevel] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [expandedException, setExpandedException] = useState<string | null>(null);

  const { data: logs, isLoading, refetch } = useGetLogsQuery({
    page,
    pageSize,
    level: level || undefined,
    from: from || undefined,
    to: to || undefined,
    search: search || undefined,
  });

  const { data: stats } = useGetLogStatsQuery();

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Logs</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor application logs and errors in real-time.
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={() => refetch()} sx={{ color: "text.secondary" }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Logs", value: stats?.total ?? 0, icon: <InfoOutlinedIcon />, color: "info.main" },
          { label: "Errors Today", value: stats?.errorsToday ?? 0, icon: <ErrorOutlineIcon />, color: "error.main" },
          { label: "Warnings Today", value: stats?.warningsToday ?? 0, icon: <WarningAmberIcon />, color: "warning.main" },
          { label: "Info Today", value: stats?.infoToday ?? 0, icon: <CheckCircleRoundedIcon />, color: "success.main" },
        ].map((stat) => (
          <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ color: stat.color, display: "flex" }}>{stat.icon}</Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: "1.1rem" }}>
                  {stat.value.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
        <Box sx={{ p: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            sx={{ minWidth: 200 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            size="small"
            label="Level"
            value={level}
            onChange={(e) => { setLevel(e.target.value); setPage(1); }}
            sx={{ minWidth: 130 }}
          >
            {levelOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="date"
            label="From"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1); }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Level</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Path</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs?.items.length ? (
                logs.items.map((log) => (
                  <TableRow key={log.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                    <TableCell sx={{ whiteSpace: "nowrap", fontFamily: "monospace", fontSize: "0.8rem" }}>
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.level}
                        size="small"
                        color={levelColors[String(log.level).toLowerCase()] ?? "default"}
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          textTransform: "capitalize",
                          bgcolor: String(log.level).toLowerCase() === "fatal" ? "error.dark" : undefined,
                          color: String(log.level).toLowerCase() === "fatal" ? "#fff" : undefined,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.message}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: "text.secondary" }}>
                      {log.requestPath ?? "—"}
                    </TableCell>
                    <TableCell align="right">
                      {log.exception && (
                        <Tooltip title="Toggle exception details">
                          <IconButton
                            size="small"
                            onClick={() => setExpandedException(expandedException === log.id ? null : log.id)}
                            color={expandedException === log.id ? "primary" : "default"}
                          >
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No logs found matching your filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ProductPagination
        pageNumber={logs?.pageNumber ?? 1}
        totalPages={logs?.totalPages ?? 1}
        totalCount={logs?.totalCount ?? 0}
        onPageChange={setPage}
      />

      {logs?.items.map((log) => (
        <Collapse key={log.id} in={expandedException === log.id} timeout="auto">
          <Paper variant="outlined" sx={{ borderRadius: 2, mt: 1, p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Exception Details — {log.id}
            </Typography>
            <Alert severity="error" sx={{ fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {log.exception}
            </Alert>
          </Paper>
        </Collapse>
      ))}
    </Box>
  );
}
