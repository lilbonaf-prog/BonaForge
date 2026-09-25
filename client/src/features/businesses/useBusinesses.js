import {
  useQuery,
} from "@tanstack/react-query";

import {
  getBusinesses,
} from "../../services/businessService";

export const useBusinesses =
  () => {
    return useQuery({
      queryKey: [
        "businesses",
      ],

      queryFn:
        getBusinesses,

      staleTime:
        30 * 1000,

      retry: 1,
    });
  };