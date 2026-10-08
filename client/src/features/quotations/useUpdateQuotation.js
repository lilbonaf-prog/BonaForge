import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  updateQuotation,
} from "../../services/quotationService";

const useUpdateQuotation = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      updateQuotation,

    onSuccess: (
      data,
      variables
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          "quotations",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "quotations",
          "detail",
          variables?.quotationId,
        ],
      });

      const leadId =
        data?.quotation?.lead?._id ||
        data?.quotation?.lead;

      if (leadId) {
        queryClient.invalidateQueries({
          queryKey: [
            "quotations",
            "lead",
            leadId,
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

export default useUpdateQuotation;