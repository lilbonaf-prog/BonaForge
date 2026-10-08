import {
  useQuery,
} from "@tanstack/react-query";

import {
  getQuotationsByProposal,
} from "../../services/quotationService";

const useProposalQuotations = (
  proposalId
) =>
  useQuery({
    queryKey: [
      "quotations",
      "proposal",
      proposalId,
    ],

    queryFn: () =>
      getQuotationsByProposal(
        proposalId
      ),

    enabled:
      Boolean(proposalId),

    staleTime:
      30 * 1000,

    retry: 1,
  });

export default useProposalQuotations;