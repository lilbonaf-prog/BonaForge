import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  updateLeadActivity,
} from "../../services/leadActivityService";

const useUpdateLeadActivity = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      updateLeadActivity,

    onSuccess: (
      data,
      variables
    ) => {
      const leadId =
        data?.activity?.lead?._id ||
        data?.activity?.lead ||
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

export default useUpdateLeadActivity;