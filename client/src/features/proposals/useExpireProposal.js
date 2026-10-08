import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  expireProposal,
} from "../../services/proposalService";

const useExpireProposal = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      expireProposal,

    onSuccess: (
      data,
      proposalId
    ) => {
      const leadId =
        data?.proposal?.lead?._id ||
        data?.proposal?.lead;

      queryClient.invalidateQueries({
        queryKey: [
          "proposals",
        ],
      });

      if (proposalId) {
        queryClient.invalidateQueries({
          queryKey: [
            "proposals",
            "detail",
            proposalId,
          ],
        });
      }

      if (leadId) {
        queryClient.invalidateQueries({
          queryKey: [
            "proposals",
            "lead",
            leadId,
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "lead",
            leadId,
          ],
        });
      }

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

export default useExpireProposal;