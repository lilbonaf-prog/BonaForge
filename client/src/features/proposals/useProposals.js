import { useQuery } from "@tanstack/react-query";

import {
  getProposals,
} from "../../services/proposalService";

const useProposals = (
  params = {}
) =>
  useQuery({
    queryKey: [
      "proposals",
      params,
    ],

    queryFn: () =>
      getProposals(
        params
      ),

    staleTime: 30_000,

    retry: 1,
  });

export default useProposals;