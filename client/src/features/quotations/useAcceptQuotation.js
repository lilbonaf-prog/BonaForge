import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  acceptQuotation,
} from "../../services/quotationService";

const useAcceptQuotation = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      acceptQuotation,

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

        queryClient.invalidateQueries({
          queryKey: [
            "leads",
            "detail",
            leadId,
          ],
        });
      }

      queryClient.invalidateQueries({
        queryKey: [
          "leads",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
          "overview",
        ],
      });
    },
  });
};

export default useAcceptQuotation;