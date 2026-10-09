import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAnalytics,
} from "../../services/analyticsService";

const useAnalytics = (
  params = {}
) =>
  useQuery({
    queryKey: [
      "analytics",
      params,
    ],

    queryFn: () =>
      getAnalytics(
        params
      ),

    staleTime:
      30 * 1000,

    retry: 1,
  });

export default useAnalytics;