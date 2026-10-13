import {
  useState,
} from "react";

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getCurrentUser,
} from "../../services/authService";

import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from "../../utils/authToken";

import {
  AuthContext,
} from "./authContext";

export const AuthProvider = ({
  children,
}) => {
  const queryClient =
    useQueryClient();

  const [token, setToken] =
    useState(
      () => getAuthToken()
    );

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      "auth",
      "me",
    ],

    queryFn: async () => {
      try {
        return await getCurrentUser();
      } catch (error) {
        const status =
          error?.response?.status;

        if (
          status === 401 ||
          status === 403
        ) {
          removeAuthToken();
          setToken(null);

          queryClient.removeQueries({
            queryKey: [
              "auth",
              "me",
            ],
          });
        }

        throw error;
      }
    },

    enabled: Boolean(token),
    retry: false,
  });

  const user =
    data?.user || null;

  const saveSession = (
    authToken,
    authUser
  ) => {
    setAuthToken(authToken);
    setToken(authToken);

    if (authUser) {
      queryClient.setQueryData(
        [
          "auth",
          "me",
        ],
        {
          success: true,
          user: authUser,
        }
      );
    }
  };

  const clearSession = () => {
    removeAuthToken();
    setToken(null);

    queryClient.removeQueries({
      queryKey: [
        "auth",
        "me",
      ],
    });
  };

  const refreshUser =
    async () => {
      if (!token) {
        return null;
      }

      const result =
        await refetch();

      return (
        result.data?.user ||
        null
      );
    };

  const value = {
    token,
    user,

    isAuthenticated:
      Boolean(
        token && user
      ),

    isAuthLoading:
      Boolean(token) &&
      (isLoading ||
        isFetching),

    saveSession,
    clearSession,
    refreshUser,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};