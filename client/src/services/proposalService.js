import api from "./api";

export const getProposals = async (
  params = {}
) => {
  const response = await api.get(
    "/proposals",
    {
      params,
    }
  );

  return response.data;
};

export const getProposalById = async (
  proposalId
) => {
  const response = await api.get(
    `/proposals/${proposalId}`
  );

  return response.data;
};

export const getProposalsByLead = async (
  leadId
) => {
  const response = await api.get(
    `/proposals/lead/${leadId}`
  );

  return response.data;
};

export const createProposal = async ({
  leadId,
  payload,
}) => {
  const response = await api.post(
    `/proposals/lead/${leadId}`,
    payload
  );

  return response.data;
};

export const updateProposal = async ({
  proposalId,
  payload,
}) => {
  const response = await api.patch(
    `/proposals/${proposalId}`,
    payload
  );

  return response.data;
};

export const sendProposal = async (
  proposalId
) => {
  const response = await api.post(
    `/proposals/${proposalId}/send`
  );

  return response.data;
};

export const acceptProposal = async (
  proposalId
) => {
  const response = await api.post(
    `/proposals/${proposalId}/accept`
  );

  return response.data;
};

export const rejectProposal = async (
  proposalId
) => {
  const response = await api.post(
    `/proposals/${proposalId}/reject`
  );

  return response.data;
};

export const expireProposal = async (
  proposalId
) => {
  const response = await api.post(
    `/proposals/${proposalId}/expire`
  );

  return response.data;
};

export const reopenProposal = async (
  proposalId
) => {
  const response = await api.post(
    `/proposals/${proposalId}/reopen`
  );

  return response.data;
};

export const deleteProposal = async (
  proposalId
) => {
  const response = await api.delete(
    `/proposals/${proposalId}`
  );

  return response.data;
};