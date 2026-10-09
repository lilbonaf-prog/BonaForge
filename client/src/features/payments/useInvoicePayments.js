import {
  useQuery,
} from "@tanstack/react-query";

import {
  getInvoicePayments,
} from "../../services/paymentService";

const useInvoicePayments = (
  invoiceId
) =>
  useQuery({
    queryKey: [
      "payments",
      "invoice",
      invoiceId,
    ],

    queryFn: () =>
      getInvoicePayments(
        invoiceId
      ),

    enabled: Boolean(
      invoiceId
    ),

    staleTime: 30 * 1000,

    retry: 1,
  });

export default useInvoicePayments;