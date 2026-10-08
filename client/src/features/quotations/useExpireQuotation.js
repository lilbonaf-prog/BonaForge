import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  expireQuotation,
} from "../../services/quotationService";

const useExpireQuotation = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      expireQuotation,

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

export default useExpireQuotation;