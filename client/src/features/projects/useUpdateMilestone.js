import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  updateMilestone,
} from "../../services/projectService";

const useUpdateMilestone = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      updateMilestone,

    onSuccess: (
      data,
      variables
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          "projects",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "projects",
          "detail",
          variables?.projectId,
        ],
      });

      const leadId =
        data?.project?.lead?._id ||
        data?.project?.lead;

      if (leadId) {
        queryClient.invalidateQueries({
          queryKey: [
            "projects",
            "lead",
            leadId,
          ],
        });
      }
    },
  });
};

export default useUpdateMilestone;