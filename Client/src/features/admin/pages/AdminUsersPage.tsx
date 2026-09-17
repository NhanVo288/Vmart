import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import EditIcon from "@mui/icons-material/Edit";
import { useGetAdminUsersQuery, useUpdateUserRolesMutation } from "../../../stores/adminApi";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";

const availableRoles = ["Admin", "User", "Vendor"];

export function AdminUsersPage() {
  const { data: users, isLoading } = useGetAdminUsersQuery();
  const [updateRoles, { isLoading: isUpdating }] = useUpdateUserRolesMutation();
  const [editUser, setEditUser] = useState<{
    id: string;
    email: string;
    roles: string[];
  } | null>(null);

  const handleSave = useCallback(async () => {
    if (!editUser) return;
    try {
      await updateRoles({ id: editUser.id, roles: editUser.roles }).unwrap();
    } catch {}
    setEditUser(null);
  }, [editUser, updateRoles]);

  const toggleRole = useCallback(
    (role: string) => {
      if (!editUser) return;
      setEditUser((prev) => {
        if (!prev) return prev;
        const roles = prev.roles.includes(role)
          ? prev.roles.filter((r) => r !== role)
          : [...prev.roles, role];
        return { ...prev, roles };
      });
    },
    [editUser]
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Users
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage user accounts and roles
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        {isLoading ? (
          <LoadingSkeleton variant="table" />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Roles</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users?.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: "primary.main",
                            fontSize: "0.875rem",
                            fontWeight: 700,
                          }}
                        >
                          {user.email.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {user.userName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {user.roles.map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            color={role === "Admin" ? "primary" : role === "Vendor" ? "secondary" : "default"}
                            variant={role === "Admin" || role === "Vendor" ? "filled" : "outlined"}
                            sx={{ fontWeight: 600 }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setEditUser({ id: user.id, email: user.email, roles: [...user.roles] })
                        }
                        sx={{ color: "primary.main" }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {users?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No users found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={!!editUser}
        onClose={() => setEditUser(null)}
        slotProps={{
          paper: { sx: { borderRadius: 2, maxWidth: 400 } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Roles</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {editUser?.email}
          </Typography>
          <FormGroup>
            {availableRoles.map((role) => (
              <FormControlLabel
                key={role}
                control={
                  <Checkbox
                    checked={editUser?.roles.includes(role) ?? false}
                    onChange={() => toggleRole(role)}
                  />
                }
                label={role}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setEditUser(null)}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isUpdating}
            startIcon={isUpdating ? <CircularProgress size={16} /> : undefined}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
