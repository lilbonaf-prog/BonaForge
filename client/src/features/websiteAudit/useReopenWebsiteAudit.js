import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { reopenWebsiteAudit } from "../../services/websiteAuditService";

const useReopenWebsiteAudit = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      reopenWebsiteAudit,

    onSuccess: (
      data
    ) => {
      const businessId =
        data?.audit?.business?._id ||
        data?.audit?.business;

      queryClient.invalidateQueries({
        queryKey: [
          "website-audits",
        ],
      });

      if (businessId) {
        queryClient.invalidateQueries({
          queryKey: [
            "website-audits",
            "business",
            businessId,
          ],
        });
      }

      queryClient.invalidateQueries({
        queryKey: [
          "businesses",
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

export default useReopenWebsiteAudit;