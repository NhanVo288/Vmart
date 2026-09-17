import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import NotificationsActive from "@mui/icons-material/NotificationsActive";
import CheckCircle from "@mui/icons-material/CheckCircle";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { useSubscribeToStockMutation } from "../../stores/stockNotificationApi";

interface NotifyMeButtonProps {
  productId: number;
  compact?: boolean;
}

export function NotifyMeButton({ productId, compact = false }: NotifyMeButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribe, { isLoading, isSuccess }] = useSubscribeToStockMutation();

  const handleClose = () => {
    setOpen(false);
    setEmail("");
  };

  if (isSuccess) {
    return (
      <Button
        size="small"
        fullWidth
        disabled
        startIcon={<CheckCircle sx={{ fontSize: 16 }} />}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          color: "#4ade80",
          bgcolor: "rgba(74, 222, 128, 0.08)",
          opacity: 1,
          "&.Mui-disabled": {
            color: "#4ade80",
            bgcolor: "rgba(74, 222, 128, 0.08)",
            opacity: 1,
          },
        }}
      >
        Notified
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        fullWidth
        startIcon={<NotificationsActive sx={{ fontSize: 16 }} />}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 600,
          borderColor: "rgba(251, 191, 36, 0.5)",
          color: "#fbbf24",
          "&:hover": {
            borderColor: "#fbbf24",
            bgcolor: "rgba(251, 191, 36, 0.08)",
          },
        }}
      >
        {compact ? "Notify" : "Notify Me"}
      </Button>

      <SubscribeDialog
        open={open}
        onClose={handleClose}
        email={email}
        setEmail={setEmail}
        isLoading={isLoading}
        subscribe={subscribe}
        productId={productId}
      />
    </>
  );
}

function SubscribeDialog({
  open,
  onClose,
  email,
  setEmail,
  isLoading,
  subscribe,
  productId,
}: {
  open: boolean;
  onClose: () => void;
  email: string;
  setEmail: (v: string) => void;
  isLoading: boolean;
  subscribe: any;
  productId: number;
}) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setErrorMsg(null);
    try {
      await subscribe({ email: email.trim(), productId }).unwrap();
      onClose();
    } catch (err: any) {
      const message = err?.data || err?.data?.message || "Something went wrong.";
      setErrorMsg(typeof message === "string" ? message : message?.message || "Something went wrong.");
    }
  };

  const handleClose = () => {
    setErrorMsg(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth onClick={(e) => e.stopPropagation()}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Get notified when available
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter your email and we'll let you know when this product is back in stock.
        </Typography>
        {errorMsg && (
          <Alert
            severity="info"
            icon={<InfoOutlined />}
            onClose={() => setErrorMsg(null)}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {errorMsg}
          </Alert>
        )}
        <TextField
          autoFocus
          fullWidth
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !email.trim()}
          startIcon={isLoading ? <CircularProgress size={16} /> : <NotificationsActive />}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Subscribe
        </Button>
      </DialogActions>
    </Dialog>
  );
}
