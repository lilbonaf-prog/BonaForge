import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  completeResearch,
} from "../../services/researchService";

// ==============================
// COMPLETE RESEARCH MUTATION
// ==============================

const useCompleteResearch = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      completeResearch,

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

export default useCompleteResearch;