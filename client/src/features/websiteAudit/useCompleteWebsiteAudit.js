import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { completeWebsiteAudit } from "../../services/websiteAuditService";

const useCompleteWebsiteAudit = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      completeWebsiteAudit,

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

export default useCompleteWebsiteAudit;