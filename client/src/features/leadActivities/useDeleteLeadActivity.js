import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteLeadActivity,
} from "../../services/leadActivityService";

const useDeleteLeadActivity = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      deleteLeadActivity,

    onSuccess: () => {
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

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
          "overview",
        ],
      });
    },
  });
};

export default useDeleteLeadActivity;