import {
  useQuery,
} from "@tanstack/react-query";

import {
  getBusinessById,
} from "../../services/businessService";

export const useBusiness =
  (businessId) => {
    return useQuery({
      queryKey: [
        "businesses",
        businessId,
      ],

      queryFn: () =>
        getBusinessById(
          businessId
        ),

      enabled:
        Boolean(
          businessId
        ),

      staleTime:
        30 * 1000,

      retry: 1,
    });
  };