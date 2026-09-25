import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteBusiness,
} from "../../services/businessService";

export const useDeleteBusiness =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        deleteBusiness,

      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [
              "businesses",
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