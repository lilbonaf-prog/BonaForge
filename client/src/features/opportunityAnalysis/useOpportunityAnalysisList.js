import { useQuery } from "@tanstack/react-query";

import { getOpportunityAnalysisList } from "../../services/opportunityAnalysisService";

const useOpportunityAnalysisList = (params = {}) => {
  return useQuery({
    queryKey: [
      "opportunity-analysis",
      params,
    ],

    queryFn: () =>
      getOpportunityAnalysisList(
        params
      ),

    staleTime: 30_000,

    retry: 1,
  });
};

export default useOpportunityAnalysisList;