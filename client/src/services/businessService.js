import api from "./api";

// ==============================
// GET BUSINESSES
// ==============================

export const getBusinesses =
  async () => {
    const response =
      await api.get(
        "/businesses"
      );

    return response.data;
  };

// ==============================
// GET SINGLE BUSINESS
// ==============================

export const getBusinessById =
  async (businessId) => {
    const response =
      await api.get(
        `/businesses/${businessId}`
      );

    return response.data;
  };

// ==============================
// CREATE BUSINESS
// ==============================

export const createBusiness =
  async (payload) => {
    const response =
      await api.post(
        "/businesses",
        payload
      );

    return response.data;
  };

// ==============================
// UPDATE BUSINESS
// ==============================

export const updateBusiness =
  async ({
    businessId,
    payload,
  }) => {
    const response =
      await api.patch(
        `/businesses/${businessId}`,
        payload
      );

    return response.data;
  };

// ==============================
// DELETE BUSINESS
// ==============================

export const deleteBusiness =
  async (businessId) => {
    const response =
      await api.delete(
        `/businesses/${businessId}`
      );

    return response.data;
  };