import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProposal,
} from "../../services/proposalService";

const useCreateProposal = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createProposal,

    onSuccess: (
      data,
      variables
    ) => {
      const leadId =
        variables?.leadId;

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

      if (leadId) {
        queryClient.invalidateQueries({
          queryKey: [
            "lead",
            leadId,
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "proposals",
            "lead",
            leadId,
          ],
        });
      }

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
          "overview",
        ],
      });
    },
  });
};

export default useCreateProposal;