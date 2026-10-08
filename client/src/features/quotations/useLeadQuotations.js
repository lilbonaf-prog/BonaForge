import {
  useQuery,
} from "@tanstack/react-query";

import {
  getQuotationsByLead,
} from "../../services/quotationService";

const useLeadQuotations = (
  leadId
) =>
  useQuery({
    queryKey: [
      "quotations",
      "lead",
      leadId,
    ],

    queryFn: () =>
      getQuotationsByLead(
        leadId
      ),

    enabled:
      Boolean(leadId),

    staleTime:
      30 * 1000,

    retry: 1,
  });

export default useLeadQuotations;