import {
  useQuery,
} from "@tanstack/react-query";

import {
  getProjects,
} from "../../services/projectService";

const useProjects = (
  params = {}
) =>
  useQuery({
    queryKey: [
      "projects",
      params,
    ],

    queryFn: () =>
      getProjects(params),

    staleTime:
      30 * 1000,

    retry: 1,
  });

export default useProjects;