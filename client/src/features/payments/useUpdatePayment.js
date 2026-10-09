import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  updatePayment,
} from "../../services/paymentService";

const useUpdatePayment = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      updatePayment,

    onSuccess: (
      data,
      variables
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          "payments",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "payments",
          "detail",
          variables.paymentId,
        ],
      });

      const invoiceId =
        data?.payment?.invoice?._id ||
        data?.payment?.invoice;

      if (invoiceId) {
        queryClient.invalidateQueries({
          queryKey: [
            "payments",
            "invoice",
            invoiceId,
          ],
        });
      }

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
          "overview",
        ],
      });
    },
  });
};

export default useUpdatePayment;