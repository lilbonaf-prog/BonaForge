import api from "./api";

export const getOpportunityAnalysisList = async (
  params = {}
) => {
  const response = await api.get(
    "/opportunity-analysis",
    {
      params,
    }
  );

  return response.data;
};

export const getOpportunityAnalysisByBusiness = async (
  businessId
) => {
  const response = await api.get(
    `/opportunity-analysis/business/${businessId}`
  );

  return response.data;
};

export const startOpportunityAnalysis = async (
  businessId
) => {
  const response = await api.post(
    `/opportunity-analysis/business/${businessId}/start`
  );

  return response.data;
};

export const updateOpportunityAnalysis = async ({
  analysisId,
  payload,
}) => {
  const response = await api.patch(
    `/opportunity-analysis/${analysisId}`,
    payload
  );

  return response.data;
};

export const completeOpportunityAnalysis = async (
  analysisId
) => {
  const response = await api.post(
    `/opportunity-analysis/${analysisId}/complete`
  );

  return response.data;
};

export const reopenOpportunityAnalysis = async (
  analysisId
) => {
  const response = await api.post(
    `/opportunity-analysis/${analysisId}/reopen`
  );

  return response.data;
};