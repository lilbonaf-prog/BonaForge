import {
  useQuery,
} from "@tanstack/react-query";

import {
  getResearchList,
} from "../../services/researchService";

// ==============================
// RESEARCH LIST QUERY HOOK
// ==============================

const useResearchList = (
  params = {}
) => {
  return useQuery({
    queryKey: [
      "research",
      params,
    ],

    queryFn: () =>
      getResearchList(params),

    staleTime: 30_000,

    retry: 1,
  });
};

export default useResearchList;