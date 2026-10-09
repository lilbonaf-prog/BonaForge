import {
  useQuery,
} from "@tanstack/react-query";

import {
  getPaymentById,
} from "../../services/paymentService";

const usePayment = (
  paymentId
) =>
  useQuery({
    queryKey: [
      "payments",
      "detail",
      paymentId,
    ],

    queryFn: () =>
      getPaymentById(
        paymentId
      ),

    enabled: Boolean(
      paymentId
    ),

    staleTime: 30 * 1000,

    retry: 1,
  });

export default usePayment;