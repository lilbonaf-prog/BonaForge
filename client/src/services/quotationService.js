import api from "./api";

export const getQuotations = async (
  params = {}
) => {
  const response = await api.get(
    "/quotations",
    {
      params,
    }
  );

  return response.data;
};

export const getQuotationById =
  async (quotationId) => {
    const response = await api.get(
      `/quotations/${quotationId}`
    );

    return response.data;
  };

export const getQuotationsByLead =
  async (leadId) => {
    const response = await api.get(
      `/quotations/lead/${leadId}`
    );

    return response.data;
  };

export const getQuotationsByProposal =
  async (proposalId) => {
    const response = await api.get(
      `/quotations/proposal/${proposalId}`
    );

    return response.data;
  };

export const createQuotation =
  async ({
    leadId,
    payload,
  }) => {
    const response = await api.post(
      `/quotations/lead/${leadId}`,
      payload
    );

    return response.data;
  };

export const updateQuotation =
  async ({
    quotationId,
    payload,
  }) => {
    const response = await api.patch(
      `/quotations/${quotationId}`,
      payload
    );

    return response.data;
  };

export const sendQuotation =
  async (quotationId) => {
    const response = await api.post(
      `/quotations/${quotationId}/send`
    );

    return response.data;
  };

export const acceptQuotation =
  async (quotationId) => {
    const response = await api.post(
      `/quotations/${quotationId}/accept`
    );

    return response.data;
  };

export const rejectQuotation =
  async (quotationId) => {
    const response = await api.post(
      `/quotations/${quotationId}/reject`
    );

    return response.data;
  };

export const expireQuotation =
  async (quotationId) => {
    const response = await api.post(
      `/quotations/${quotationId}/expire`
    );

    return response.data;
  };

export const reopenQuotation =
  async (quotationId) => {
    const response = await api.post(
      `/quotations/${quotationId}/reopen`
    );

    return response.data;
  };

export const deleteQuotation =
  async (quotationId) => {
    const response = await api.delete(
      `/quotations/${quotationId}`
    );

    return response.data;
  };