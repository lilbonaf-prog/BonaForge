import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  updateBusiness,
} from "../../services/businessService";

export const useUpdateBusiness =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        updateBusiness,

      onSuccess: async (
        data,
        variables
      ) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [
              "businesses",
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "businesses",
              variables.businessId,
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              "dashboard",
              "overview",
            ],
          }),
        ]);
      },
    });
  };