import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteLead,
} from "../../services/leadService";

// ==============================
// DELETE LEAD MUTATION
// ==============================

const useDeleteLead = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      deleteLead,

    onSuccess: () => {
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
          "dashboard",
          "overview",
        ],
      });
    },
  });
};

export default useDeleteLead;