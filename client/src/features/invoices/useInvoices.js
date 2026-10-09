import {
  useQuery,
} from "@tanstack/react-query";

import {
  getInvoices,
} from "../../services/invoiceService";

const useInvoices = (
  params = {}
) =>
  useQuery({
    queryKey: [
      "invoices",
      params,
    ],

    queryFn: () =>
      getInvoices(
        params
      ),

    staleTime:
      30 * 1000,

    retry: 1,
  });

export default useInvoices;