import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  reopenInvoice,
} from "../../services/invoiceService";

const useReopenInvoice = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      reopenInvoice,

    onSuccess: (
      data,
      invoiceId
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          "invoices",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "invoices",
          "detail",
          invoiceId,
        ],
      });

      const projectId =
        data?.invoice?.project?._id ||
        data?.invoice?.project;

      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: [
            "invoices",
            "project",
            projectId,
          ],
        });
      }

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
          "dashboard",
          "overview",
        ],
      });
    },
  });
};

export default useReopenInvoice;