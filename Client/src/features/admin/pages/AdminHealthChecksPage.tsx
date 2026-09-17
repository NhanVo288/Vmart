import { useGetHealthChecksQuery } from "../../../stores/adminApi";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import StorageIcon from "@mui/icons-material/Storage";
import ConstructionIcon from "@mui/icons-material/Construction";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react"; // used for expandedCheck state
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";

const serviceIcons: Record<string, React.ReactNode> = {
  sqlserver: <StorageIcon />,
  hangfire: <ConstructionIcon />,
  sepay: <PaymentIcon />,
  elasticsearch: <SearchIcon />,
};

const serviceLabels: Record<string, string> = {
  sqlserver: "SQL Server",
  hangfire: "Hangfire",
  sepay: "SePay",
  elasticsearch: "Elasticsearch",
};

const statusConfig: Record<string, { color: "success" | "error" | "warning" | "default"; icon: React.ReactElement }> = {
  Healthy: { color: "success", icon: <CheckCircleIcon /> },
  Unhealthy: { color: "error", icon: <ErrorIcon /> },
  Degraded: { color: "warning", icon: <WarningAmberIcon /> },
};

export function AdminHealthChecksPage() {
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const { data: healthCheck, isLoading, isError, error, refetch } = useGetHealthChecksQuery();

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;
  if (isError) {
    console.error('Health checks error:', error);
    const status = (error as any)?.status ?? '???';
    const message = (error as any)?.data?.message ?? 'Unknown error';
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load health checks (status {status}): {message}</Alert>
      </Box>
    );
  }

  const checks: any[] = healthCheck?.checks ?? [];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Health Checks</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor the health status of all system services.
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={() => refetch()} sx={{ color: "text.secondary" }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ color: healthCheck?.status === "Healthy" ? "success.main" : "error.main", display: "flex" }}>
              {healthCheck?.status === "Healthy" ? <CheckCircleIcon /> : <ErrorIcon />}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: "1.1rem" }}>
                {healthCheck?.status ?? "Unknown"}
              </Typography>
              <Typography variant="caption" color="text.secondary">Overall Status</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ color: "info.main", display: "flex" }}>
              <StorageIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: "1.1rem" }}>
                {healthCheck?.checks.length ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">Total Checks</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ color: "success.main", display: "flex" }}>
              <CheckCircleIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: "1.1rem" }}>
                {healthCheck?.checks.filter(c => c.status === "Healthy").length ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">Healthy</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ color: "info.main", display: "flex" }}>
              <StorageIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: "1.1rem" }}>
                {(healthCheck?.totalDuration ?? 0).toFixed(0)}ms
              </Typography>
              <Typography variant="caption" color="text.secondary">Total Duration</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {checks.map((check) => {
          const config = statusConfig[check.status] ?? statusConfig.Healthy;
          const isExpanded = expandedCheck === check.name;

          return (
            <Grid size={{ xs: 12, md: 4 }} key={check.name}>
              <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: `${config.color}.main`,
                          color: `${config.color}.contrastText`,
                        }}
                      >
                        {serviceIcons[check.name] ?? <StorageIcon />}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {serviceLabels[check.name] ?? check.name}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={check.status}
                      size="small"
                      color={config.color}
                      icon={config.icon}
                      sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {check.duration.toFixed(1)}ms
                    </Typography>
                  </Box>

                  {check.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: "0.85rem" }}>
                      {check.description}
                    </Typography>
                  )}

                  {check.exception && (
                    <Box sx={{ mt: 1.5 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          cursor: "pointer",
                          color: "error.main",
                          "&:hover": { opacity: 0.8 },
                        }}
                        onClick={() => setExpandedCheck(isExpanded ? null : check.name)}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          View Error
                        </Typography>
                        {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </Box>
                      <Collapse in={isExpanded} timeout="auto">
                        <Alert severity="error" sx={{ mt: 1, fontFamily: "monospace", fontSize: "0.8rem" }}>
                          {check.exception}
                        </Alert>
                      </Collapse>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
