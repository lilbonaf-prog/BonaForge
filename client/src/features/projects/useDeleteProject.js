import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteProject,
} from "../../services/projectService";

const useDeleteProject = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      deleteProject,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "projects",
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

export default useDeleteProject;