import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteProposal,
} from "../../services/proposalService";

const useDeleteProposal = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      deleteProposal,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "proposals",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "leads",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
          "overview",
        ],
      });
    },
  });
};

export default useDeleteProposal;