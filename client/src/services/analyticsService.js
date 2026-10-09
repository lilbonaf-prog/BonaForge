import api from "./api";

export const getAnalytics = async (
  params = {}
) => {
  const response =
    await api.get(
      "/analytics",
      {
        params,
      }
    );

  return response.data;
};