import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateOpportunityAnalysis } from "../../services/opportunityAnalysisService";

const useUpdateOpportunityAnalysis = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      updateOpportunityAnalysis,

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
    },
  });
};

export default useUpdateOpportunityAnalysis;