import { useQuery } from "@tanstack/react-query";

import { getOpportunityAnalysisByBusiness } from "../../services/opportunityAnalysisService";

const useOpportunityAnalysisByBusiness = (
  businessId
) => {
  return useQuery({
    queryKey: [
      "opportunity-analysis",
      "business",
      businessId,
    ],

    queryFn: () =>
      getOpportunityAnalysisByBusiness(
        businessId
      ),

    enabled: Boolean(
      businessId
    ),

    staleTime: 30_000,

    retry: 1,
  });
};

export default useOpportunityAnalysisByBusiness;