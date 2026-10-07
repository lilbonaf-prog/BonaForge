import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createLeadActivity,
} from "../../services/leadActivityService";

const useCreateLeadActivity = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createLeadActivity,

    onSuccess: (
      data,
      variables
    ) => {
      const leadId =
        variables?.leadId;

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

export default useCreateLeadActivity;