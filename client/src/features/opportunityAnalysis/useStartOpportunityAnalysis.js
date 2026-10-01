import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { startOpportunityAnalysis } from "../../services/opportunityAnalysisService";

const useStartOpportunityAnalysis = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      businessId
    ) =>
      startOpportunityAnalysis(
        businessId
      ),

    onSuccess: (
      _data,
      businessId
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          "opportunity-analysis",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "opportunity-analysis",
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

export default useStartOpportunityAnalysis;