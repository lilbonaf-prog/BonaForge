import {
  useQuery,
} from "@tanstack/react-query";

import {
  getPayments,
} from "../../services/paymentService";

const usePayments = (
  params = {}
) =>
  useQuery({
    queryKey: [
      "payments",
      params,
    ],

    queryFn: () =>
      getPayments(params),

    staleTime: 30 * 1000,

    retry: 1,
  });

export default usePayments;