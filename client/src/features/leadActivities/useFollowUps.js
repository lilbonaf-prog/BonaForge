import { useQuery } from "@tanstack/react-query";

import {
  getFollowUps,
} from "../../services/leadActivityService";

const useFollowUps = (
  params = {}
) =>
  useQuery({
    queryKey: [
      "follow-ups",
      params,
    ],
    queryFn: () =>
      getFollowUps(params),
    staleTime: 30_000,
    retry: 1,
  });

export default useFollowUps;