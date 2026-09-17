import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Button from "@mui/material/Button";
import { formatPrice } from "../../../config/constants";
import { useLazyGetSepayPaymentStatusQuery, type SepayPaymentRequest } from "../../../stores/paymentApi";
import type { OrderDto } from "../../../types/order";

export function PaymentForm({ payment, onSuccess }: {
  payment: SepayPaymentRequest;
  onSuccess: (order: OrderDto) => void;
}) {
  const [checkStatus] = useLazyGetSepayPaymentStatusQuery();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const result = await checkStatus(payment.paymentReference, false).unwrap();
        if (active && result.status === "paid" && result.order) onSuccess(result.order);
      } catch {
        if (active) setError("Không thể kiểm tra trạng thái thanh toán. Hệ thống sẽ thử lại.");
      }
    };
    void poll();
    const timer = window.setInterval(poll, 3000);
    return () => { active = false; window.clearInterval(timer); };
  }, [checkStatus, onSuccess, payment.paymentReference]);

  const copyReference = async () => navigator.clipboard.writeText(payment.paymentReference);

  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Quét mã QR để thanh toán</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Mở ứng dụng ngân hàng, quét QR và giữ nguyên số tiền cùng nội dung chuyển khoản.
      </Typography>
      <Box component="img" src={payment.qrUrl} alt="Mã QR thanh toán SePay"
        sx={{ width: "100%", maxWidth: 360, borderRadius: 2, border: "1px solid", borderColor: "divider" }} />
      <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 2, textAlign: "left" }}>
        <Typography variant="body2"><strong>Ngân hàng:</strong> {payment.bankName}</Typography>
        <Typography variant="body2"><strong>Số tài khoản:</strong> {payment.bankAccountNumber}</Typography>
        {payment.accountHolder && <Typography variant="body2"><strong>Chủ tài khoản:</strong> {payment.accountHolder}</Typography>}
        <Typography variant="body2"><strong>Số tiền:</strong> {formatPrice(payment.amount)}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
          <Typography variant="body2" sx={{ wordBreak: "break-all" }}><strong>Nội dung:</strong> {payment.paymentReference}</Typography>
          <Button size="small" onClick={copyReference} aria-label="Sao chép nội dung chuyển khoản"><ContentCopy fontSize="small" /></Button>
        </Box>
      </Box>
      {error && <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mt: 2 }}>
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">Đang chờ SePay xác nhận giao dịch…</Typography>
      </Box>
    </Box>
  );
}
