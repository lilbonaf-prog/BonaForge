import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  rejectQuotation,
} from "../../services/quotationService";

const useRejectQuotation = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      rejectQuotation,

    onSuccess: (
      data,
      quotationId
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
          quotationId,
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

export default useRejectQuotation;