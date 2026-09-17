import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CircularProgress from "@mui/material/CircularProgress";

import {
  useGetAdminNotificationsQuery,
  useMarkAdminNotificationReadMutation,
  useMarkAllAdminNotificationsReadMutation,
} from "../../../stores/adminApi";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminNotificationsWidget() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data: notifications, isLoading, isFetching } = useGetAdminNotificationsQuery({
    pageNumber,
    pageSize,
  });

  const [markRead] = useMarkAdminNotificationReadMutation();
  const [markAllRead] = useMarkAllAdminNotificationsReadMutation();

  const totalPages = notifications ? Math.ceil(notifications.totalCount / pageSize) : 1;
  const unreadCount = notifications?.items.filter((n) => !n.isRead).length ?? 0;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <NotificationsIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Vendor Product Real-Time Notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Real-time activity logs when vendors add or delete products
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} new`}
              color="error"
              size="small"
              sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22 }}
            />
          )}
          <Tooltip title="Mark all notifications as read">
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={() => markAllRead()}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem" }}
            >
              Mark all read
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Content Scrollable Section */}
      <Box
        sx={{
          minHeight: 280,
          maxHeight: 380,
          overflowY: "auto",
          p: 0,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": { borderRadius: 3, bgcolor: "action.hover" },
        }}
      >
        {isLoading || isFetching ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 280 }}>
            <CircularProgress size={32} />
          </Box>
        ) : notifications?.items && notifications.items.length > 0 ? (
          notifications.items.map((notification, index) => {
            const isCreated = notification.action === "ProductCreated";
            return (
              <Box
                key={notification.id}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  p: 2,
                  borderBottom:
                    index < notifications.items.length - 1 ? "1px solid" : "none",
                  borderColor: "divider",
                  bgcolor: notification.isRead ? "transparent" : "action.hover",
                  transition: "background-color 0.2s ease",
                  "&:hover": { bgcolor: "action.selected" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, flex: 1, pr: 1 }}>
                  <Box
                    sx={{
                      mt: 0.2,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isCreated ? "success.lighter" : "error.lighter",
                      color: isCreated ? "success.main" : "error.main",
                      flexShrink: 0,
                    }}
                  >
                    {isCreated ? (
                      <AddCircleIcon fontSize="small" color="success" />
                    ) : (
                      <DeleteForeverIcon fontSize="small" color="error" />
                    )}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                      <Chip
                        label={isCreated ? "PRODUCT ADDED" : "PRODUCT DELETED"}
                        size="small"
                        color={isCreated ? "success" : "error"}
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: "0.65rem", height: 20 }}
                      />
                      {notification.vendorName && (
                        <Chip
                          icon={<StorefrontIcon style={{ fontSize: 13 }} />}
                          label={notification.vendorName}
                          size="small"
                          variant="filled"
                          sx={{ fontWeight: 600, fontSize: "0.7rem", height: 20 }}
                        />
                      )}
                    </Box>

                    <Typography variant="body2" sx={{ fontWeight: notification.isRead ? 500 : 700, color: "text.primary" }}>
                      {notification.message}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      {formatDate(notification.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                {!notification.isRead && (
                  <Tooltip title="Mark as read">
                    <IconButton
                      size="small"
                      onClick={() => markRead(notification.id)}
                      color="primary"
                      sx={{ mt: 0.5 }}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            );
          })
        ) : (
          <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
            <NotificationsIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              No vendor notifications yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              When vendors add or delete products, real-time alerts will appear here.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Pagination Footer */}
      {notifications && notifications.totalCount > 0 && (
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "background.paper",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Rows per page:
            </Typography>
            <Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNumber(1);
              }}
              size="small"
              variant="standard"
              disableUnderline
              sx={{ fontSize: "0.8rem", fontWeight: 600 }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              Showing {Math.min((pageNumber - 1) * pageSize + 1, notifications.totalCount)} -{" "}
              {Math.min(pageNumber * pageSize, notifications.totalCount)} of {notifications.totalCount}
            </Typography>
          </Box>

          <Pagination
            count={totalPages}
            page={pageNumber}
            onChange={(_, value) => setPageNumber(value)}
            size="small"
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Paper>
  );
}
