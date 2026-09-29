import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  startResearch,
} from "../../services/researchService";

// ==============================
// START RESEARCH MUTATION
// ==============================

const useStartResearch = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      startResearch,

    onSuccess: (
      _data,
      businessId
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          "research",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "research",
          "business",
          businessId,
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
          businessId,
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

export default useStartResearch;