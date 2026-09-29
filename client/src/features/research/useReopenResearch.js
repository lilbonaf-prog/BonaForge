import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  reopenResearch,
} from "../../services/researchService";

// ==============================
// REOPEN RESEARCH MUTATION
// ==============================

const useReopenResearch = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      reopenResearch,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "research",
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

export default useReopenResearch;