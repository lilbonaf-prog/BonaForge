import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  completeLeadFollowUp,
} from "../../services/leadActivityService";

const useCompleteLeadFollowUp = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      completeLeadFollowUp,

    onSuccess: (data) => {
      const leadId =
        data?.activity?.lead?._id ||
        data?.activity?.lead;

      queryClient.invalidateQueries({
        queryKey: [
          "lead-activities",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "follow-ups",
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

export default useCompleteLeadFollowUp;