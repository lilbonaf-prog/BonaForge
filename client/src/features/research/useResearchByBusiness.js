import {
  useQuery,
} from "@tanstack/react-query";

import {
  getResearchByBusiness,
} from "../../services/researchService";

// ==============================
// BUSINESS RESEARCH QUERY HOOK
// ==============================

const useResearchByBusiness = (
  businessId
) => {
  return useQuery({
    queryKey: [
      "research",
      "business",
      businessId,
    ],

    queryFn: () =>
      getResearchByBusiness(
        businessId
      ),

    enabled: Boolean(
      businessId
    ),

    staleTime: 30_000,

    retry: 1,
  });
};

export default useResearchByBusiness;