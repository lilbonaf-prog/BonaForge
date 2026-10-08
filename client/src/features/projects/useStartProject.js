import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  startProject,
} from "../../services/projectService";

const useStartProject = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      startProject,

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

export default useStartProject;