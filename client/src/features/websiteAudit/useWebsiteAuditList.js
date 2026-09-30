import { useQuery } from "@tanstack/react-query";

import { getWebsiteAuditList } from "../../services/websiteAuditService";

const useWebsiteAuditList = (params = {}) => {
  return useQuery({
    queryKey: [
      "website-audits",
      params,
    ],

    queryFn: () =>
      getWebsiteAuditList(
        params
      ),

    staleTime: 30_000,

    retry: 1,
  });
};

export default useWebsiteAuditList;