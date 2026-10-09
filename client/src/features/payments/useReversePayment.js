import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  reversePayment,
} from "../../services/paymentService";

const useReversePayment = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      reversePayment,

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
          "detail",
          variables.paymentId,
        ],
      });

      const invoiceId =
        data?.invoice?._id ||
        data?.invoice;

      if (invoiceId) {
        queryClient.invalidateQueries({
          queryKey: [
            "payments",
            "invoice",
            invoiceId,
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "invoices",
            "detail",
            invoiceId,
          ],
        });
      }

      queryClient.invalidateQueries({
        queryKey: [
          "invoices",
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

export default useReversePayment;