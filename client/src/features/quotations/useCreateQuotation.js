import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createQuotation,
} from "../../services/quotationService";

const useCreateQuotation = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createQuotation,

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
          "lead",
          variables?.leadId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "leads",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "leads",
          "detail",
          variables?.leadId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
          "overview",
        ],
      });

      return data;
    },
  });
};

export default useCreateQuotation;