import {
  useQuery,
} from "@tanstack/react-query";

import {
  getLeadById,
} from "../../services/leadService";

// ==============================
// SINGLE LEAD QUERY HOOK
// ==============================

const useLead = (
  leadId
) => {
  return useQuery({
    queryKey: [
      "leads",
      leadId,
    ],

    queryFn: () =>
      getLeadById(
        leadId
      ),

    enabled:
      Boolean(leadId),

    staleTime:
      30_000,

    retry: 1,
  });
};

export default useLead;