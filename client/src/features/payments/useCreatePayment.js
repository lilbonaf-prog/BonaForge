import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createPayment,
} from "../../services/paymentService";

const useCreatePayment = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createPayment,

    onSuccess: (
      data,
      variables
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          "payments",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "payments",
          "invoice",
          variables.invoiceId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "invoices",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "invoices",
          "detail",
          variables.invoiceId,
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

        queryClient.invalidateQueries({
          queryKey: [
            "projects",
            "detail",
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

export default useCreatePayment;