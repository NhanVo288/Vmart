import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import LocalShipping from "@mui/icons-material/LocalShipping";
import QrCode2 from "@mui/icons-material/QrCode2";
import { useCreateSepayPaymentMutation, type SepayPaymentRequest } from "../../../stores/paymentApi";
import { useGetAddressQuery, useUpdateAddressMutation } from "../../../stores/authApi";
import { useSetShippingAddressMutation } from "../../../stores/basketApi";
import { PaymentForm } from "./PaymentForm";
import { SummarySidebar } from "./SummarySidebar";
import { OrderConfirmation } from "./OrderConfirmation";
import type { IBasket } from "../../../types/basket";
import type { AddressDto } from "../../../types/account";
import type { OrderDto } from "../../../types/order";
import { useTranslation } from "../../../lib/i18n";

export function CheckoutContent({ basket }: { basket: IBasket | undefined }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const steps = [t("contactStep"), t("shippingStep"), t("paymentStep")];
  const [createPayment, { isLoading: isPreparing }] = useCreateSepayPaymentMutation();
  const [setShippingAddress] = useSetShippingAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const { data: savedAddress } = useGetAddressQuery();

  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("VN");
  const [autoFilled, setAutoFilled] = useState(false);
  const [payment, setPayment] = useState<SepayPaymentRequest | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<OrderDto | null>(null);

  useEffect(() => {
    if (!savedAddress || autoFilled) return;
    const nameParts = savedAddress.name.split(" ");
    setFirstName(nameParts[0] ?? "");
    setLastName(nameParts.slice(1).join(" "));
    setAddress(savedAddress.line1);
    setCity(savedAddress.city);
    setState(savedAddress.state);
    setZip(savedAddress.postal_code);
    setCountry(savedAddress.country || "VN");
    setAutoFilled(true);
  }, [savedAddress, autoFilled]);

  const preparePayment = useCallback(async () => {
    setPaymentError(null);
    try {
      setPayment(await createPayment().unwrap());
    } catch (err: any) {
      setPaymentError(err?.data?.error ?? err?.data?.title ?? "Không thể tạo yêu cầu thanh toán SePay.");
    }
  }, [createPayment]);

  const continueToPayment = async () => {
    const addressDto: AddressDto = {
      name: `${firstName} ${lastName}`.trim(), line1: address, line2: "",
      city, state, postal_code: zip, country,
    };
    setPaymentError(null);
    try {
      await Promise.all([updateAddress(addressDto).unwrap(), setShippingAddress(addressDto).unwrap()]);
      setActiveStep(2);
      await preparePayment();
    } catch {
      setPaymentError("Không thể lưu địa chỉ giao hàng. Vui lòng thử lại.");
    }
  };

  if (placedOrder) return <OrderConfirmation email={email} order={placedOrder} />;

  if (!basket?.items?.length) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <ShoppingCart sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{t("cartEmpty")}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{t("addItemsBeforeCheckout")}</Typography>
        <Button variant="contained" onClick={() => navigate("/")}>{t("continueShopping")}</Button>
      </Container>
    );
  }

  const subtotal = basket.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = basket.deliveryFee ?? (subtotal > 10000 ? 0 : 500);
  const total = subtotal + deliveryFee - (basket.discount ?? 0);
  const shippingValid = Boolean(firstName && lastName && address && city && state && zip);

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper sx={{ p: { xs: 2, sm: 3.5 }, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          {activeStep === 0 && <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CheckCircleRounded sx={{ color: "success.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{t("contactStep")}</Typography>
            </Box>
            <TextField fullWidth label={t("emailAddress")} type="email" value={email}
              onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button variant="contained" disabled={!email.includes("@")} onClick={() => setActiveStep(1)}>{t("continueToShipping")}</Button>
            </Box>
          </Box>}

          {activeStep === 1 && <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <LocalShipping color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{t("shippingStep")}</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label={t("firstName")} value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label={t("lastName")} value={lastName} onChange={(e) => setLastName(e.target.value)} /></Grid>
              <Grid size={{ xs: 12 }}><TextField fullWidth label={t("addressLabel")} value={address} onChange={(e) => setAddress(e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label={t("city")} value={city} onChange={(e) => setCity(e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth label={t("state")} value={state} onChange={(e) => setState(e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth label={t("zipCode")} value={zip} onChange={(e) => setZip(e.target.value)} /></Grid>
              <Grid size={{ xs: 12 }}><FormControl fullWidth><InputLabel>{t("country")}</InputLabel>
                <Select value={country} label={t("country")} onChange={(e) => setCountry(e.target.value)}>
                  <MenuItem value="VN">Việt Nam</MenuItem>
                </Select></FormControl></Grid>
            </Grid>
            {paymentError && <Alert severity="error" sx={{ mt: 2 }}>{paymentError}</Alert>}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
              <Button onClick={() => setActiveStep(0)}>{t("back")}</Button>
              <Button variant="contained" disabled={!shippingValid || isPreparing} onClick={continueToPayment}>{t("continueToPayment")}</Button>
            </Box>
          </Box>}

          {activeStep === 2 && <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <QrCode2 color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Thanh toán SePay</Typography>
            </Box>
            {paymentError && <Alert severity="error" sx={{ mb: 2 }}>{paymentError}</Alert>}
            {payment ? <PaymentForm payment={payment} onSuccess={setPlacedOrder} /> :
              <Box sx={{ textAlign: "center", py: 6 }}><CircularProgress /><Typography sx={{ mt: 2 }}>{t("preparingPayment")}</Typography>
                {paymentError && <Button onClick={preparePayment}>{t("tryAgain")}</Button>}</Box>}
            <Button sx={{ mt: 2 }} onClick={() => setActiveStep(1)}>{t("back")}</Button>
          </Box>}
        </Paper>
      </Grid>
      <SummarySidebar basket={basket} subtotal={subtotal} deliveryFee={deliveryFee} total={total} />
    </Grid>
  );
}
