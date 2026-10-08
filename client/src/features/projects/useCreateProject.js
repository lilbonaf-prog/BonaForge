import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProject,
} from "../../services/projectService";

const useCreateProject = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createProject,

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
          "lead",
          variables?.leadId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "leads",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "leads",
          "detail",
          variables?.leadId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
          "overview",
        ],
      });

      return data;
    },
  });
};

export default useCreateProject;