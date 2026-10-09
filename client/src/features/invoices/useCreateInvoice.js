import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createInvoice,
} from "../../services/invoiceService";

const useCreateInvoice = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createInvoice,

    onSuccess: (
      data,
      variables
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          "invoices",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "invoices",
          "project",
          variables?.projectId,
        ],
      });

      const leadId =
        data?.invoice?.lead?._id ||
        data?.invoice?.lead;

      if (leadId) {
        queryClient.invalidateQueries({
          queryKey: [
            "invoices",
            "lead",
            leadId,
          ],
        });
      }

      queryClient.invalidateQueries({
        queryKey: [
          "projects",
          "detail",
          variables?.projectId,
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

export default useCreateInvoice;