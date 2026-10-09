import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteInvoice,
} from "../../services/invoiceService";

const useDeleteInvoice = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      deleteInvoice,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "invoices",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "projects",
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

export default useDeleteInvoice;