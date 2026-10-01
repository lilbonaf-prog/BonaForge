import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { reopenOpportunityAnalysis } from "../../services/opportunityAnalysisService";

const useReopenOpportunityAnalysis = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      reopenOpportunityAnalysis,

    onSuccess: (
      data
    ) => {
      const businessId =
        data?.analysis?.business?._id ||
        data?.analysis?.business;

      queryClient.invalidateQueries({
        queryKey: [
          "opportunity-analysis",
        ],
      });

      if (businessId) {
        queryClient.invalidateQueries({
          queryKey: [
            "opportunity-analysis",
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

export default useReopenOpportunityAnalysis;