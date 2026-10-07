import { useQuery } from "@tanstack/react-query";

import {
  getLeadActivities,
} from "../../services/leadActivityService";

const useLeadActivities = (
  leadId,
  params = {}
) =>
  useQuery({
    queryKey: [
      "lead-activities",
      "lead",
      leadId,
      params,
    ],
    queryFn: () =>
      getLeadActivities(
        leadId,
        params
      ),
    enabled: Boolean(leadId),
    staleTime: 30_000,
    retry: 1,
  });

export default useLeadActivities;