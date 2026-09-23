import api from "./api";

// ==============================
// REGISTER
// ==============================

export const register = async (payload) => {
  const response = await api.post(
    "/auth/register",
    payload
  );

  return response.data;
};

// ==============================
// LOGIN
// ==============================

export const login = async (payload) => {
  const response = await api.post(
    "/auth/login",
    payload
  );

  return response.data;
};

// ==============================
// CURRENT USER
// ==============================

export const getCurrentUser = async () => {
  const response = await api.get(
    "/auth/me"
  );

  return response.data;
};

// ==============================
// UPDATE PROFILE
// ==============================

export const updateProfile = async (
  payload
) => {
  const response = await api.patch(
    "/auth/profile",
    payload
  );

  return response.data;
};

// ==============================
// UPDATE AVATAR
// ==============================

export const updateAvatar = async (
  file
) => {
  const formData = new FormData();

  formData.append("avatar", file);

  const response = await api.patch(
    "/auth/avatar",
    formData
  );

  return response.data;
};

// ==============================
// REMOVE AVATAR
// ==============================

export const removeAvatar = async () => {
  const response = await api.delete(
    "/auth/avatar"
  );

  return response.data;
};

// ==============================
// CHANGE PASSWORD
// ==============================

export const changePassword = async (
  payload
) => {
  const response = await api.patch(
    "/auth/change-password",
    payload
  );

  return response.data;
};

// ==============================
// FORGOT PASSWORD
// ==============================

export const forgotPassword = async (
  payload
) => {
  const response = await api.post(
    "/auth/forgot-password",
    payload
  );

  return response.data;
};

// ==============================
// RESET PASSWORD
// ==============================

export const resetPassword = async (
  token,
  payload
) => {
  const response = await api.patch(
    `/auth/reset-password/${token}`,
    payload
  );

  return response.data;
};

// ==============================
// VERIFY EMAIL
// ==============================

export const verifyEmail = async (
  token
) => {
  const response = await api.get(
    `/auth/verify-email/${token}`
  );

  return response.data;
};

// ==============================
// RESEND VERIFICATION
// ==============================

export const resendVerification =
  async () => {
    const response = await api.post(
      "/auth/resend-verification"
    );

    return response.data;
  };

// ==============================
// LOGOUT
// ==============================

export const logout = async () => {
  const response = await api.post(
    "/auth/logout"
  );

  return response.data;
};