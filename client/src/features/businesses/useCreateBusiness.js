import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createBusiness,
} from "../../services/businessService";

export const useCreateBusiness =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        createBusiness,

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