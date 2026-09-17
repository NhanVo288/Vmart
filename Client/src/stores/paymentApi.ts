import { baseApi } from "./baseApi";
import type { OrderDto } from "../types/order";

export type SepayPaymentRequest = {
  paymentReference: string;
  qrUrl: string;
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  accountHolder: string;
};

type SepayPaymentStatus = {
  status: "pending" | "paid" | "not_found";
  order?: OrderDto;
};

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSepayPayment: builder.mutation<SepayPaymentRequest, void>({
      query: () => ({ url: "/payments/sepay-request", method: "POST" }),
      invalidatesTags: ["Basket"],
    }),
    getSepayPaymentStatus: builder.query<SepayPaymentStatus, string>({
      query: (reference) => `/payments/sepay-status/${encodeURIComponent(reference)}`,
    }),
  }),
});

export const { useCreateSepayPaymentMutation, useLazyGetSepayPaymentStatusQuery } = paymentApi;
