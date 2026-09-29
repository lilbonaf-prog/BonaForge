import api from "./api";

// ==============================
// GET ALL RESEARCH
// ==============================

export const getResearchList = async (
  params = {}
) => {
  const response = await api.get(
    "/research",
    {
      params,
    }
  );

  return response.data;
};

// ==============================
// GET RESEARCH BY BUSINESS
// ==============================

export const getResearchByBusiness =
  async (businessId) => {
    const response = await api.get(
      `/research/business/${businessId}`
    );

    return response.data;
  };

// ==============================
// START RESEARCH
// ==============================

export const startResearch = async (
  businessId
) => {
  const response = await api.post(
    `/research/business/${businessId}/start`
  );

  return response.data;
};

// ==============================
// UPDATE RESEARCH
// ==============================

export const updateResearch = async ({
  researchId,
  payload,
}) => {
  const response = await api.patch(
    `/research/${researchId}`,
    payload
  );

  return response.data;
};

// ==============================
// COMPLETE RESEARCH
// ==============================

export const completeResearch = async (
  researchId
) => {
  const response = await api.post(
    `/research/${researchId}/complete`
  );

  return response.data;
};

// ==============================
// REOPEN RESEARCH
// ==============================

export const reopenResearch = async (
  researchId
) => {
  const response = await api.post(
    `/research/${researchId}/reopen`
  );

  return response.data;
};