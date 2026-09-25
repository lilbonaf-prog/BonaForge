import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  updateLead,
} from "../../services/leadService";

// ==============================
// UPDATE LEAD MUTATION
// ==============================

const useUpdateLead = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      updateLead,

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
          "leads",
          variables.leadId,
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

export default useUpdateLead;