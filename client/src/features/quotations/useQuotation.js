import {
  useQuery,
} from "@tanstack/react-query";

import {
  getQuotationById,
} from "../../services/quotationService";

const useQuotation = (
  quotationId
) =>
  useQuery({
    queryKey: [
      "quotations",
      "detail",
      quotationId,
    ],

    queryFn: () =>
      getQuotationById(
        quotationId
      ),

    enabled:
      Boolean(quotationId),

    staleTime:
      30 * 1000,

    retry: 1,
  });

export default useQuotation;