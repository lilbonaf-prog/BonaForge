import api from "./api";

export const getLeadActivities = async (
  leadId,
  params = {}
) => {
  const response = await api.get(
    `/lead-activities/lead/${leadId}`,
    {
      params,
    }
  );

  return response.data;
};

export const getLeadActivityById = async (
  activityId
) => {
  const response = await api.get(
    `/lead-activities/${activityId}`
  );

  return response.data;
};

export const createLeadActivity = async ({
  leadId,
  payload,
}) => {
  const response = await api.post(
    `/lead-activities/lead/${leadId}`,
    payload
  );

  return response.data;
};

export const updateLeadActivity = async ({
  activityId,
  payload,
}) => {
  const response = await api.patch(
    `/lead-activities/${activityId}`,
    payload
  );

  return response.data;
};

export const deleteLeadActivity = async (
  activityId
) => {
  const response = await api.delete(
    `/lead-activities/${activityId}`
  );

  return response.data;
};

export const completeLeadFollowUp = async (
  activityId
) => {
  const response = await api.post(
    `/lead-activities/${activityId}/complete-follow-up`
  );

  return response.data;
};

export const cancelLeadFollowUp = async (
  activityId
) => {
  const response = await api.post(
    `/lead-activities/${activityId}/cancel-follow-up`
  );

  return response.data;
};

export const getFollowUps = async (
  params = {}
) => {
  const response = await api.get(
    "/lead-activities/follow-ups",
    {
      params,
    }
  );

  return response.data;
};