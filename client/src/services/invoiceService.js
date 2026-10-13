import api from "./api";

export const getInvoices = async (
  params = {}
) => {
  const response =
    await api.get(
      "/invoices",
      {
        params,
      }
    );

  return response.data;
};

export const getInvoiceById =
  async (invoiceId) => {
    const response =
      await api.get(
        `/invoices/${invoiceId}`
      );

    return response.data;
  };

export const getProjectInvoices =
  async (projectId) => {
    const response =
      await api.get(
        `/invoices/project/${projectId}`
      );

    return response.data;
  };

export const getLeadInvoices =
  async (leadId) => {
    const response =
      await api.get(
        `/invoices/lead/${leadId}`
      );

    return response.data;
  };

export const createInvoice =
  async ({
    projectId,
    payload,
  }) => {
    const response =
      await api.post(
        `/invoices/project/${projectId}`,
        payload
      );

    return response.data;
  };

export const updateInvoice =
  async ({
    invoiceId,
    payload,
  }) => {
    const response =
      await api.patch(
        `/invoices/${invoiceId}`,
        payload
      );

    return response.data;
  };

export const sendInvoice =
  async (invoiceId) => {
    const response =
      await api.post(
        `/invoices/${invoiceId}/send`
      );

    return response.data;
  };

export const markInvoiceOverdue =
  async (invoiceId) => {
    const response =
      await api.post(
        `/invoices/${invoiceId}/overdue`
      );

    return response.data;
  };

export const cancelInvoice =
  async ({
    invoiceId,
    cancellationReason = "",
  }) => {
    const response =
      await api.post(
        `/invoices/${invoiceId}/cancel`,
        {
          cancellationReason,
        }
      );

    return response.data;
  };

export const reopenInvoice =
  async (invoiceId) => {
    const response =
      await api.post(
        `/invoices/${invoiceId}/reopen`
      );

    return response.data;
  };

// ==============================
// SECURE CLIENT SHARING
// ==============================

export const createInvoiceShareLink =
  async ({
    invoiceId,
    expiresInDays = 30,
  }) => {
    const response =
      await api.post(
        `/invoices/${invoiceId}/share`,
        {
          expiresInDays,
        }
      );

    return response.data;
  };

export const revokeInvoiceShareLink =
  async (
    invoiceId
  ) => {
    const response =
      await api.delete(
        `/invoices/${invoiceId}/share`
      );

    return response.data;
  };

// ==============================
// PUBLIC READ-ONLY INVOICE
// ==============================

export const getPublicInvoiceByToken =
  async (
    token
  ) => {
    const response =
      await api.get(
        `/share/invoice/${token}`
      );

    return response.data;
  };

export const deleteInvoice =
  async (invoiceId) => {
    const response =
      await api.delete(
        `/invoices/${invoiceId}`
      );

    return response.data;
  };