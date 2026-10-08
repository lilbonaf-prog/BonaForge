import {
  useQuery,
} from "@tanstack/react-query";

import {
  getProjectById,
} from "../../services/projectService";

const useProject = (
  projectId
) =>
  useQuery({
    queryKey: [
      "projects",
      "detail",
      projectId,
    ],

    queryFn: () =>
      getProjectById(
        projectId
      ),

    enabled:
      Boolean(projectId),

    staleTime:
      30 * 1000,

    retry: 1,
  });

export default useProject;