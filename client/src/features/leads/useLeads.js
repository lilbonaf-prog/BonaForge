import {
  useQuery,
} from "@tanstack/react-query";

import {
  getLeads,
} from "../../services/leadService";

// ==============================
// LEADS QUERY HOOK
// ==============================

const useLeads = (
  params = {}
) => {
  return useQuery({
    queryKey: [
      "leads",
      params,
    ],

    queryFn: () =>
      getLeads(params),

    staleTime: 30_000,

    retry: 1,
  });
};

export default useLeads;