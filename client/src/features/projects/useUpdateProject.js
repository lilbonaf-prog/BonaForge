import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  updateProject,
} from "../../services/projectService";

const useUpdateProject = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      updateProject,

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

        queryClient.invalidateQueries({
          queryKey: [
            "leads",
            "detail",
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

export default useUpdateProject;