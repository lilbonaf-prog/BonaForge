import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  completeProject,
} from "../../services/projectService";

const useCompleteProject = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      completeProject,

    onSuccess: (
      data,
      projectId
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
          projectId,
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

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
          "overview",
        ],
      });
    },
  });
};

export default useCompleteProject;