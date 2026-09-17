import { useState, useRef, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import StorefrontIcon from "@mui/icons-material/Storefront";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTheme } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";

import {
  useGetAdminNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAdminNotificationReadMutation,
  useMarkAllAdminNotificationsReadMutation,
} from "../../../stores/adminApi";
import type { IAdminNotification } from "../../../types/adminNotification";

const PAGE_SIZE = 4;

const RING_ANIMATION_NAME = "notification-ring";
const PULSE_ANIMATION_NAME = "notification-pulse";

// Ensure UTC dates (without timezone info) are parsed as UTC, not local time.
// ASP.NET Core returns ISO strings like "2026-08-11T04:37:00Z" (with Z when
// configured correctly) or "2026-08-11T04:37:00" (without Z as fallback).
// Both cases are handled to always parse as UTC.
function toUTC(dateStr: string): Date {
  const hasTimezone = dateStr.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(dateStr);
  return hasTimezone ? new Date(dateStr) : new Date(dateStr + "Z");
}

function formatRelativeTime(dateStr: string): string {
  const date = toUTC(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateTime(dateStr: string): string {
  const date = toUTC(dateStr);
  return date.toLocaleString("en-US", {
    timeZone: "Africa/Cairo",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminNotificationBell() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Popover state
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  // Filter state
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [actionFilter, setActionFilter] = useState<"all" | "created" | "deleted">("all");

  // Infinite scroll state
  const [page, setPage] = useState(1);
  const [loadedItems, setLoadedItems] = useState<IAdminNotification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasMore = loadedItems.length < totalCount;

  const filteredItems = loadedItems.filter((notification) => {
    if (actionFilter === "created") {
      return notification.action === "ProductCreated";
    }
    if (actionFilter === "deleted") {
      return notification.action === "ProductDeleted";
    }
    return true;
  });

  // Query for the open popover pages
  const isReadFilter = filter === "all" ? undefined : filter === "read";
  const { data, isLoading, isFetching } = useGetAdminNotificationsQuery(
    { pageNumber: page, pageSize: PAGE_SIZE, isRead: isReadFilter },
    { skip: !open },
  );

  // Always-on query for badge unread count — refetches automatically when
  // SignalR triggers baseApi.util.invalidateTags(["AdminNotification"])
  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery();

  const [markRead] = useMarkAdminNotificationReadMutation();
  const [markAllRead] = useMarkAllAdminNotificationsReadMutation();

  // Merge new page data into loadedItems
  useEffect(() => {
    if (!data) return;
    setTotalCount(data.totalCount);
    setLoadedItems((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newItems = data.items.filter((n) => !existingIds.has(n.id));
      
      const updatedPrev = prev.map((item) => {
        const matchingNewItem = data.items.find((n) => n.id === item.id);
        return matchingNewItem ? matchingNewItem : item;
      });

      const merged = [...updatedPrev, ...newItems];
      return merged.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [data]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    setPage(1);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleActionFilterChange = (newActionFilter: "all" | "created" | "deleted") => {
    setActionFilter(newActionFilter);
  };

    // Read/Unread filter handler
  const handleFilterChange = (newFilter: "all" | "unread" | "read") => {
    setFilter(newFilter);
    setPage(1);
    setLoadedItems([]);
    setTotalCount(0);
  };

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isFetching || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 80) {
      setPage((p) => p + 1);
    }
  }, [isFetching, hasMore]);

  const handleMarkAllRead = async () => {
    await markAllRead();
    setLoadedItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkRead = async (id: number) => {
    await markRead(id);
    setLoadedItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const hasUnread = loadedItems.some((n) => !n.isRead);

  return (
    <>
      <GlobalStyles
        styles={{
          "@keyframes notification-ring": {
            "0%": { transform: "rotate(0deg)" },
            "10%": { transform: "rotate(14deg)" },
            "20%": { transform: "rotate(-8deg)" },
            "30%": { transform: "rotate(14deg)" },
            "40%": { transform: "rotate(-4deg)" },
            "50%": { transform: "rotate(10deg)" },
            "60%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(0deg)" },
          },
          "@keyframes notification-pulse": {
            "0%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.7)" },
            "70%": { boxShadow: "0 0 0 8px rgba(239, 68, 68, 0)" },
            "100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)" },
          },
        }}
      />
      {/* ── Bell Icon Button ── */}
      <Tooltip title="Vendor Notifications">
        <IconButton
          id="notification-bell-btn"
          onClick={handleOpen}
          aria-label="Open vendor notifications"
          sx={{
            mr: 0.5,
            color: open ? "primary.main" : "text.secondary",
            position: "relative",
            transition: "color 0.2s ease",
            "&:hover": { color: "primary.main" },
            ...(unreadCount > 0 && {
              animation: `${RING_ANIMATION_NAME} 2.5s ease infinite`,
              transformOrigin: "50% 0%",
            }),
          }}
        >
          <Badge
            badgeContent={unreadCount > 99 ? "99+" : unreadCount || undefined}
            color="error"
            overlap="circular"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.6rem",
                fontWeight: 700,
                minWidth: 16,
                height: 16,
                padding: "0 3px",
                ...(unreadCount > 0 && {
                  animation: `${PULSE_ANIMATION_NAME} 2s infinite`,
                }),
              },
            }}
          >
            {open ? (
              <NotificationsIcon fontSize="small" />
            ) : (
              <NotificationsNoneIcon fontSize="small" />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      {/* ── Popover Panel ── */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            id: "notification-popover",
            elevation: 0,
            sx: {
              mt: 1.5,
              width: 390,
              maxWidth: "calc(100vw - 24px)",
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              background: isDark
                ? "rgba(14, 14, 22, 0.97)"
                : "rgba(255,255,255,0.98)",
              backdropFilter: "blur(20px)",
              boxShadow: isDark
                ? "0 24px 64px rgba(0,0,0,0.6)"
                : "0 24px 64px rgba(0,0,0,0.14)",
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            pt: 2,
            pb: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: isDark
              ? "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.1) 100%)"
              : "linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(168,85,247,0.04) 100%)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                flexShrink: 0,
              }}
            >
              <NotificationsIcon sx={{ fontSize: 19, color: "#fff" }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, lineHeight: 1.2 }}
              >
                Vendor Activity
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {totalCount > 0
                  ? `${totalCount} notification${totalCount !== 1 ? "s" : ""}${hasUnread ? " · some unread" : ""}`
                  : "No notifications yet"}
              </Typography>
            </Box>
          </Box>

          {hasUnread && (
            <Tooltip title="Mark all as read">
              <Button
                size="small"
                startIcon={<DoneAllIcon sx={{ fontSize: "14px !important" }} />}
                onClick={handleMarkAllRead}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.73rem",
                  borderRadius: 1.5,
                  color: "primary.main",
                  minWidth: 0,
                  px: 1.2,
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "#fff",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                All read
              </Button>
            </Tooltip>
          )}
        </Box>

        <Divider />

        {/* Filter Bar (Status on Left, Action Icons on Right) */}
        <Box
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
            borderBottom: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          }}
        >
          {/* Status filter chips: All, Unread, Read */}
          <Box sx={{ display: "flex", gap: 0.8 }}>
            {(["all", "unread", "read"] as const).map((f) => (
              <Chip
                key={f}
                label={f === "all" ? "All" : f === "unread" ? "Unread" : "Read"}
                size="small"
                onClick={() => handleFilterChange(f)}
                variant={filter === f ? "filled" : "outlined"}
                color={filter === f ? "primary" : "default"}
                sx={{
                  fontWeight: 600,
                  fontSize: "0.68rem",
                  height: 24,
                  borderRadius: 1.5,
                  "& .MuiChip-label": { px: 1 },
                  cursor: "pointer",
                }}
              />
            ))}
          </Box>

          {/* Action filter icon buttons: All, Added, Deleted */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.3,
              bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              borderRadius: 2,
              p: 0.4,
              border: "1px solid",
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
            }}
          >
            <Tooltip title="All activities">
              <IconButton
                size="small"
                onClick={() => handleActionFilterChange("all")}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1.5,
                  bgcolor: actionFilter === "all" ? (isDark ? "rgba(255,255,255,0.15)" : "#fff") : "transparent",
                  color: actionFilter === "all" ? "primary.main" : "text.secondary",
                  boxShadow: actionFilter === "all" ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                  "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" },
                  transition: "all 0.15s ease",
                }}
              >
                <FilterListIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Added products">
              <IconButton
                size="small"
                onClick={() => handleActionFilterChange("created")}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1.5,
                  bgcolor: actionFilter === "created" ? "rgba(34,197,94,0.2)" : "transparent",
                  color: actionFilter === "created" ? "success.main" : "text.secondary",
                  boxShadow: actionFilter === "created" ? "0 1px 4px rgba(34,197,94,0.2)" : "none",
                  "&:hover": { bgcolor: "rgba(34,197,94,0.15)" },
                  transition: "all 0.15s ease",
                }}
              >
                <AddCircleOutlinedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Deleted products">
              <IconButton
                size="small"
                onClick={() => handleActionFilterChange("deleted")}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1.5,
                  bgcolor: actionFilter === "deleted" ? "rgba(239,68,68,0.2)" : "transparent",
                  color: actionFilter === "deleted" ? "error.main" : "text.secondary",
                  boxShadow: actionFilter === "deleted" ? "0 1px 4px rgba(239,68,68,0.2)" : "none",
                  "&:hover": { bgcolor: "rgba(239,68,68,0.15)" },
                  transition: "all 0.15s ease",
                }}
              >
                <DeleteOutlinedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Scrollable notification list */}
        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          sx={{
            maxHeight: 400,
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 2,
              bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
              "&:hover": {
                bgcolor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.18)",
              },
            },
          }}
        >
          {/* Loading state (first load) */}
          {isLoading && loadedItems.length === 0 && (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
              }}
            >
              <CircularProgress
                size={28}
                thickness={4}
                sx={{ color: "primary.main" }}
              />
              <Typography variant="caption" color="text.secondary">
                Loading notifications…
              </Typography>
            </Box>
          )}

          {/* Empty state */}
          {!isLoading && filteredItems.length === 0 && (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                px: 3,
                py: 5,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
                  mb: 0.5,
                }}
              >
                <NotificationsNoneIcon
                  sx={{ fontSize: 28, color: "text.disabled" }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.secondary" }}
              >
                {actionFilter !== "all" || filter !== "all"
                  ? "No matching notifications"
                  : "You're all caught up!"}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ lineHeight: 1.5 }}
              >
                {actionFilter !== "all" || filter !== "all"
                  ? "Try selecting a different filter to see notifications."
                  : "When vendors add or delete products, real-time alerts will appear here."}
              </Typography>
            </Box>
          )}

          {/* Notification rows */}
          {filteredItems.map((notification, idx) => {
            const isCreated = notification.action === "ProductCreated";
            return (
              <Box
                key={notification.id}
                id={`notification-item-${notification.id}`}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  borderBottom:
                    idx < loadedItems.length - 1 ? "1px solid" : "none",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.06)",
                  bgcolor: notification.isRead
                    ? "transparent"
                    : isDark
                      ? "rgba(99,102,241,0.07)"
                      : "rgba(99,102,241,0.04)",
                  transition: "background-color 0.2s ease",
                  position: "relative",
                  "&:hover": {
                    bgcolor: isDark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.025)",
                  },
                }}
              >
                {/* Unread left-border accent */}
                {!notification.isRead && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: "12%",
                      bottom: "12%",
                      width: 3,
                      borderRadius: "0 2px 2px 0",
                      bgcolor: isCreated ? "success.main" : "error.main",
                    }}
                  />
                )}

                {/* Action icon */}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isCreated
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(239,68,68,0.1)",
                    flexShrink: 0,
                    mt: 0.2,
                  }}
                >
                  {isCreated ? (
                    <AddCircleOutlinedIcon
                      sx={{ fontSize: 18, color: "success.main" }}
                    />
                  ) : (
                    <DeleteOutlinedIcon
                      sx={{ fontSize: 18, color: "error.main" }}
                    />
                  )}
                </Box>

                {/* Text content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.8,
                      mb: 0.4,
                      flexWrap: "wrap",
                    }}
                  >
                    <Chip
                      label={isCreated ? "Added" : "Deleted"}
                      size="small"
                      color={isCreated ? "success" : "error"}
                      variant="outlined"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.59rem",
                        height: 17,
                        "& .MuiChip-label": { px: 0.7 },
                      }}
                    />
                    {notification.vendorName && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.3,
                          color: "text.secondary",
                        }}
                      >
                        <StorefrontIcon sx={{ fontSize: 11 }} />
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.67rem", fontWeight: 600 }}
                        >
                          {notification.vendorName}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.81rem",
                      fontWeight: notification.isRead ? 400 : 600,
                      color: "text.primary",
                      lineHeight: 1.4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {notification.message}
                  </Typography>

                  <Tooltip title={formatDateTime(notification.createdAt)} placement="bottom-start">
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ mt: 0.3, display: "block", fontSize: "0.67rem", cursor: "default" }}
                    >
                      {formatRelativeTime(notification.createdAt)}
                    </Typography>
                  </Tooltip>
                </Box>

                {/* Mark-read button */}
                {!notification.isRead && (
                  <Tooltip title="Mark as read">
                    <IconButton
                      size="small"
                      id={`mark-read-btn-${notification.id}`}
                      onClick={() => handleMarkRead(notification.id)}
                      sx={{
                        flexShrink: 0,
                        width: 26,
                        height: 26,
                        mt: 0.2,
                        color: "text.disabled",
                        "&:hover": {
                          bgcolor: "primary.main",
                          color: "#fff",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <CheckCircleOutlinedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            );
          })}

          {/* Fetching more spinner (infinite scroll) */}
          {isFetching && page > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 2,
                gap: 1,
              }}
            >
              <CircularProgress size={16} thickness={5} />
              <Typography variant="caption" color="text.secondary">
                Loading more…
              </Typography>
            </Box>
          )}

          {/* End of list */}
          {!hasMore && loadedItems.length > 0 && !isFetching && (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontSize: "0.68rem" }}
              >
                ── End of notifications ──
              </Typography>
            </Box>
          )}
        </Box>

        {/* Footer */}
        {totalCount > 0 && (
          <>
            <Divider />
            <Box
              sx={{
                px: 2.5,
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: isDark
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(0,0,0,0.015)",
              }}
            >
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontSize: "0.68rem" }}
              >
                {loadedItems.length} / {totalCount} loaded
              </Typography>
              {hasMore && (
                <Button
                  size="small"
                  onClick={() => setPage((p) => p + 1)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.68rem",
                    color: "primary.main",
                    minWidth: 0,
                    p: 0,
                    minHeight: 0,
                    lineHeight: 1,
                    verticalAlign: "middle",
                    "&:hover": {
                      bgcolor: "transparent",
                      color: "primary.dark",
                      textDecoration: "underline",
                    },
                  }}
                >
                  ↓ Click to load more
                </Button>
              )}
            </Box>
          </>
        )}
      </Popover>
    </>
  );
}
