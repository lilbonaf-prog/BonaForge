import {
  useQuery,
} from "@tanstack/react-query";

import {
  getDashboardOverview,
} from "../../services/dashboardService";

export const useDashboardOverview =
  () => {
    return useQuery({
      queryKey: [
        "dashboard",
        "overview",
      ],

      queryFn:
        getDashboardOverview,

      staleTime:
        30 * 1000,

      retry: 1,
    });
  };