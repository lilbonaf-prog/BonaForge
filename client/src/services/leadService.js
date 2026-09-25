import api from "./api";

// ==============================
// GET ALL LEADS
// ==============================

export const getLeads = async (params = {}) => {
  const response = await api.get(
    "/leads",
    {
      params,
    }
  );

  return response.data;
};

// ==============================
// GET SINGLE LEAD
// ==============================

export const getLeadById = async (
  leadId
) => {
  const response = await api.get(
    `/leads/${leadId}`
  );

  return response.data;
};

// ==============================
// CREATE LEAD
// ==============================

export const createLead = async (
  payload
) => {
  const response = await api.post(
    "/leads",
    payload
  );

  return response.data;
};

// ==============================
// UPDATE LEAD
// ==============================

export const updateLead = async ({
  leadId,
  payload,
}) => {
  const response = await api.patch(
    `/leads/${leadId}`,
    payload
  );

  return response.data;
};

// ==============================
// DELETE LEAD
// ==============================

export const deleteLead = async (
  leadId
) => {
  const response = await api.delete(
    `/leads/${leadId}`
  );

  return response.data;
};

// ==============================
// CONVERT BUSINESS TO LEAD
// ==============================

export const convertBusinessToLead =
  async ({
    businessId,
    payload = {},
  }) => {
    const response = await api.post(
      `/leads/from-business/${businessId}`,
      payload
    );

    return response.data;
  };