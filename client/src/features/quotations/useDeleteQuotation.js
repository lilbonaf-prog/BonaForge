import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteQuotation,
} from "../../services/quotationService";

const useDeleteQuotation = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      deleteQuotation,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "quotations",
        ],
      });

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

export default useDeleteQuotation;