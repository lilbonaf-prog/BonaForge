import {
  useQuery,
} from "@tanstack/react-query";

import {
  getQuotations,
} from "../../services/quotationService";

const useQuotations = (
  params = {}
) =>
  useQuery({
    queryKey: [
      "quotations",
      params,
    ],

    queryFn: () =>
      getQuotations(params),

    staleTime:
      30 * 1000,

    retry: 1,
  });

export default useQuotations;