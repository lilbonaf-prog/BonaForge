import { useQuery } from "@tanstack/react-query";

import { getWebsiteAuditByBusiness } from "../../services/websiteAuditService";

const useWebsiteAuditByBusiness = (
  businessId
) => {
  return useQuery({
    queryKey: [
      "website-audits",
      "business",
      businessId,
    ],

    queryFn: () =>
      getWebsiteAuditByBusiness(
        businessId
      ),

    enabled: Boolean(
      businessId
    ),

    staleTime: 30_000,

    retry: 1,
  });
};

export default useWebsiteAuditByBusiness;