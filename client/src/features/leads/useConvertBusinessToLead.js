import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  convertBusinessToLead,
} from "../../services/leadService";

// ==============================
// CONVERT BUSINESS TO LEAD
// ==============================

const useConvertBusinessToLead =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        convertBusinessToLead,

      onSuccess: (
        data,
        variables
      ) => {
        queryClient.invalidateQueries({
          queryKey: [
            "leads",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "businesses",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "businesses",
            variables.businessId,
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "dashboard",
            "overview",
          ],
        });

        return data;
      },
    });
  };

export default useConvertBusinessToLead;