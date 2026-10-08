import { useQuery } from "@tanstack/react-query";

import {
  getProposalById,
} from "../../services/proposalService";

const useProposal = (
  proposalId
) =>
  useQuery({
    queryKey: [
      "proposals",
      "detail",
      proposalId,
    ],

    queryFn: () =>
      getProposalById(
        proposalId
      ),

    enabled: Boolean(
      proposalId
    ),

    staleTime: 30_000,

    retry: 1,
  });

export default useProposal;