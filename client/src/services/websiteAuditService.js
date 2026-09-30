import api from "./api";

export const getWebsiteAuditList = async (params = {}) => {
  const response = await api.get(
    "/website-audits",
    {
      params,
    }
  );

  return response.data;
};

export const getWebsiteAuditByBusiness = async (
  businessId
) => {
  const response = await api.get(
    `/website-audits/business/${businessId}`
  );

  return response.data;
};

export const startWebsiteAudit = async (
  businessId
) => {
  const response = await api.post(
    `/website-audits/business/${businessId}/start`
  );

  return response.data;
};

export const updateWebsiteAudit = async ({
  auditId,
  payload,
}) => {
  const response = await api.patch(
    `/website-audits/${auditId}`,
    payload
  );

  return response.data;
};

export const completeWebsiteAudit = async (
  auditId
) => {
  const response = await api.post(
    `/website-audits/${auditId}/complete`
  );

  return response.data;
};

export const reopenWebsiteAudit = async (
  auditId
) => {
  const response = await api.post(
    `/website-audits/${auditId}/reopen`
  );

  return response.data;
};