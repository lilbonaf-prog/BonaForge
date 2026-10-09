import {
  useQuery,
} from "@tanstack/react-query";

import {
  getInvoiceById,
} from "../../services/invoiceService";

const useInvoice = (
  invoiceId
) =>
  useQuery({
    queryKey: [
      "invoices",
      "detail",
      invoiceId,
    ],

    queryFn: () =>
      getInvoiceById(
        invoiceId
      ),

    enabled:
      Boolean(
        invoiceId
      ),

    staleTime:
      30 * 1000,

    retry: 1,
  });

export default useInvoice;