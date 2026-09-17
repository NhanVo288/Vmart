import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import ShieldIcon from "@mui/icons-material/Shield";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HomeIcon from "@mui/icons-material/Home";
import PublicIcon from "@mui/icons-material/Public";
import { useAppSelector } from "../../../stores/hooks";
import {
  useGetUserInfoQuery,
  useGetAddressQuery,
  useUpdateAddressMutation,
} from "../../../stores/authApi";
import type { AddressDto } from "../../../types/account";
import { GRADIENT } from "../../../config/constants";
import { PageLayout } from "../../../components/layout/PageLayout";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";

export function ProfilePage() {
  const { isInitialized } = useAppSelector((state) => state.auth);
  const { data: userData, isLoading: userLoading } = useGetUserInfoQuery(
    undefined,
    { skip: !isInitialized },
  );
  const {
    data: address,
    isLoading: addressLoading,
    refetch: refetchAddress,
  } = useGetAddressQuery(undefined, { skip: !userData });
  const [updateAddress, { isLoading: updating }] = useUpdateAddressMutation();

  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<AddressDto>({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "EG",
  });

  if (!isInitialized) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const startEditing = () => {
    setForm({
      name: address?.name ?? "",
      line1: address?.line1 ?? "",
      line2: address?.line2 ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      postal_code: address?.postal_code ?? "",
      country: address?.country ?? "EG",
    });
    setEditing(true);
    setError("");
  };

  const cancelEditing = () => {
    setEditing(false);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    try {
      await updateAddress(form).unwrap();
      setSuccess("Address saved successfully");
      setEditing(false);
      refetchAddress();
    } catch {
      setError("Failed to save address");
    }
  };

  const isLoading = userLoading || addressLoading;

  if (isLoading) return <LoadingSkeleton variant="profile" />;

  return (
    <PageLayout maxWidth="sm">
      <>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Box
            sx={{
              bgcolor: "background.default",
              borderRadius: "50%",
              p: 1.2,
              display: "flex",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 4px 20px rgba(77,184,209,0.25)"
                  : "0 4px 20px rgba(13,33,55,0.2)",
            }}
          >
            <PersonIcon sx={{ color: "primary.main", fontSize: 28 }} />
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
            My Profile
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {/* Account Card */}
        <Card
          sx={{
            borderRadius: 4,
            backdropFilter: "blur(20px)",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(15,20,30,0.85)"
                : "rgba(255,255,255,0.85)",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)"
                : "0 8px 40px rgba(13,33,55,0.1), 0 0 0 1px rgba(13,33,55,0.06)",
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}
            >
              <PersonIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Account
              </Typography>
            </Box>

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
              <EmailIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", lineHeight: 1.2 }}
                >
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {userData?.email || "—"}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ShieldIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", lineHeight: 1.2 }}
                >
                  Roles
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {userData?.roles?.join(", ") || "User"}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Address Card */}
        <Card
          sx={{
            borderRadius: 4,
            backdropFilter: "blur(20px)",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(15,20,30,0.85)"
                : "rgba(255,255,255,0.85)",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)"
                : "0 8px 40px rgba(13,33,55,0.1), 0 0 0 1px rgba(13,33,55,0.06)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <LocationOnIcon sx={{ color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Address
                </Typography>
              </Box>
              {!editing && (
                <IconButton
                  size="small"
                  onClick={startEditing}
                  sx={{ color: "primary.main" }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {editing ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  size="small"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Address Line 1"
                  size="small"
                  value={form.line1}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Address Line 2 (optional)"
                  size="small"
                  value={form.line2}
                  onChange={(e) => setForm({ ...form, line2: e.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    fullWidth
                    label="City"
                    size="small"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <TextField
                    fullWidth
                    label="State"
                    size="small"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    size="small"
                    value={form.postal_code}
                    onChange={(e) =>
                      setForm({ ...form, postal_code: e.target.value })
                    }
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <TextField
                    fullWidth
                    label="Country"
                    size="small"
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PublicIcon
                              fontSize="small"
                              sx={{ color: "text.secondary" }}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    justifyContent: "flex-end",
                    mt: 1,
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={cancelEditing}
                    sx={{ borderRadius: 2, textTransform: "none" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={
                      updating ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    onClick={handleSave}
                    disabled={updating}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      background: GRADIENT,
                      "&:hover": { background: GRADIENT },
                    }}
                  >
                    {updating ? "Saving..." : "Save"}
                  </Button>
                </Box>
              </Box>
            ) : address ? (
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <PersonIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {address.name}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 3.5 }}
                >
                  {address.line1}
                  {address.line2 && <>, {address.line2}</>}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 3.5 }}
                >
                  {address.city}, {address.state} {address.postal_code}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 3.5 }}
                >
                  {address.country}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  No address saved yet
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={startEditing}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Add Address
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </>
    </PageLayout>
  );
}
