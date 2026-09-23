const TOKEN_KEY = "bonaforge_auth_token";

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token) => {
  if (!token) {
    return;
  }

  localStorage.setItem(
    TOKEN_KEY,
    token
  );
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const hasAuthToken = () => {
  return Boolean(getAuthToken());
};