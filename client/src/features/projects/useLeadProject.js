import {
  useQuery,
} from "@tanstack/react-query";

import {
  getProjectByLead,
} from "../../services/projectService";

const useLeadProject = (
  leadId
) =>
  useQuery({
    queryKey: [
      "projects",
      "lead",
      leadId,
    ],

    queryFn: () =>
      getProjectByLead(
        leadId
      ),

    enabled:
      Boolean(leadId),

    staleTime:
      30 * 1000,

    retry: 1,
  });

export default useLeadProject;