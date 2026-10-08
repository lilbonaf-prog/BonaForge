import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  sendQuotation,
} from "../../services/quotationService";

const useSendQuotation = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      sendQuotation,

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

export default useSendQuotation;