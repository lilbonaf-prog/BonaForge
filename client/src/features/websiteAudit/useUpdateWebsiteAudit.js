import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateWebsiteAudit } from "../../services/websiteAuditService";

const useUpdateWebsiteAudit = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      updateWebsiteAudit,

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
    },
  });
};

export default useUpdateWebsiteAudit;