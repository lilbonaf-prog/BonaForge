import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { startWebsiteAudit } from "../../services/websiteAuditService";

const useStartWebsiteAudit = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      businessId
    ) =>
      startWebsiteAudit(
        businessId
      ),

    onSuccess: (
      _data,
      businessId
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          "website-audits",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "website-audits",
          "business",
          businessId,
        ],
      });

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

export default useStartWebsiteAudit;