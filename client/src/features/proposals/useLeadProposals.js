import { useQuery } from "@tanstack/react-query";

import {
  getProposalsByLead,
} from "../../services/proposalService";

const useLeadProposals = (
  leadId
) =>
  useQuery({
    queryKey: [
      "proposals",
      "lead",
      leadId,
    ],

    queryFn: () =>
      getProposalsByLead(
        leadId
      ),

    enabled: Boolean(
      leadId
    ),

    staleTime: 30_000,

    retry: 1,
  });

export default useLeadProposals;