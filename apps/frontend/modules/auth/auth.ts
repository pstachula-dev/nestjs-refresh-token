import axios, { AxiosError, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const enum AuthApi {
  signin = "/auth/signin",
  signup = "/auth/signup",
  logout = "/auth/logout",
  refresh = "/auth/refresh",
  protected = "/auth/protected",
  csrf = "/auth/csrf",
  user = "/auth/user",
}

export type UserPayload = {
  password: string;
  email: string;
};

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

const setAuthorizationHeader = (token: string) => {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

apiClient.interceptors.request.use(
  (config) => {
    return {
      ...config,
      withCredentials: true,
      headers: {
        ...config.headers,
        "CSRF-Token": Cookies.get("X-CSRF") || "",
      },
    };
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (res) => res,
  async function (error: AxiosError) {
    if (
      error?.response?.status === 401 &&
      !error?.response?.request.withCredentials
    ) {
      const body = await postRefresh();
      return apiClient.request({
        ...error.config,
        headers: {
          Authorization: `Bearer ${body.data.accessToken}`,
        },
      });
    }

    return Promise.reject(error);
  }
);

export const getCSRF = () => {
  return apiClient.get(AuthApi.csrf, { withCredentials: true });
};

export const postSignUp = (data?: UserPayload) => {
  return apiClient.post(AuthApi.signup, data);
};

export const postSignIn = async (data?: UserPayload) => {
  const body = await apiClient.post(AuthApi.signin, data, {
    withCredentials: true,
  });
  setAuthorizationHeader(body.data.accessToken);
  return body;
};

export const postLogout = () => {
  return apiClient.post(AuthApi.logout).then(() => {
    setAuthorizationHeader("");
  });
};

export const postRefresh = async (config?: AxiosRequestConfig) => {
  const body = await apiClient.get(AuthApi.refresh, {
    withCredentials: true,
    ...config,
  });
  setAuthorizationHeader(body.data.accessToken);
  return body;
};

export const getProtected = () => {
  return apiClient.post(AuthApi.protected);
};
