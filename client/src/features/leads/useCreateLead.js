import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createLead,
} from "../../services/leadService";

// ==============================
// CREATE LEAD MUTATION
// ==============================

const useCreateLead = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createLead,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "leads",
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

export default useCreateLead;