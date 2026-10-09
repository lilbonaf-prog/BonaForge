import {
  useQuery,
} from "@tanstack/react-query";

import {
  getProjectInvoices,
} from "../../services/invoiceService";

const useProjectInvoices = (
  projectId
) =>
  useQuery({
    queryKey: [
      "invoices",
      "project",
      projectId,
    ],

    queryFn: () =>
      getProjectInvoices(
        projectId
      ),

    enabled:
      Boolean(
        projectId
      ),

    staleTime:
      30 * 1000,

    retry: 1,
  });

export default useProjectInvoices;