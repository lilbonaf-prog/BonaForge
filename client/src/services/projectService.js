import api from "./api";

export const getProjects = async (
  params = {}
) => {
  const response =
    await api.get(
      "/projects",
      {
        params,
      }
    );

  return response.data;
};

export const getProjectById =
  async (projectId) => {
    const response =
      await api.get(
        `/projects/${projectId}`
      );

    return response.data;
  };

export const getProjectByLead =
  async (leadId) => {
    const response =
      await api.get(
        `/projects/lead/${leadId}`
      );

    return response.data;
  };

export const createProject =
  async ({
    leadId,
    payload,
  }) => {
    const response =
      await api.post(
        `/projects/lead/${leadId}`,
        payload
      );

    return response.data;
  };

export const updateProject =
  async ({
    projectId,
    payload,
  }) => {
    const response =
      await api.patch(
        `/projects/${projectId}`,
        payload
      );

    return response.data;
  };

export const startProject =
  async (projectId) => {
    const response =
      await api.post(
        `/projects/${projectId}/start`
      );

    return response.data;
  };

export const holdProject =
  async (projectId) => {
    const response =
      await api.post(
        `/projects/${projectId}/hold`
      );

    return response.data;
  };

export const completeProject =
  async (projectId) => {
    const response =
      await api.post(
        `/projects/${projectId}/complete`
      );

    return response.data;
  };

export const cancelProject =
  async ({
    projectId,
    cancellationReason = "",
  }) => {
    const response =
      await api.post(
        `/projects/${projectId}/cancel`,
        {
          cancellationReason,
        }
      );

    return response.data;
  };

export const reopenProject =
  async (projectId) => {
    const response =
      await api.post(
        `/projects/${projectId}/reopen`
      );

    return response.data;
  };

export const addMilestone =
  async ({
    projectId,
    payload,
  }) => {
    const response =
      await api.post(
        `/projects/${projectId}/milestones`,
        payload
      );

    return response.data;
  };

export const updateMilestone =
  async ({
    projectId,
    milestoneId,
    payload,
  }) => {
    const response =
      await api.patch(
        `/projects/${projectId}/milestones/${milestoneId}`,
        payload
      );

    return response.data;
  };

export const deleteMilestone =
  async ({
    projectId,
    milestoneId,
  }) => {
    const response =
      await api.delete(
        `/projects/${projectId}/milestones/${milestoneId}`
      );

    return response.data;
  };

export const deleteProject =
  async (projectId) => {
    const response =
      await api.delete(
        `/projects/${projectId}`
      );

    return response.data;
  };