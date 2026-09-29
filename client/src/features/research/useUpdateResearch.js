import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  updateResearch,
} from "../../services/researchService";

// ==============================
// UPDATE RESEARCH MUTATION
// ==============================

const useUpdateResearch = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      updateResearch,

    onSuccess: (
      data
    ) => {
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

      return data;
    },
  });
};

export default useUpdateResearch;