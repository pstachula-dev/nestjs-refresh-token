import axios, { AxiosError } from 'axios'
import Cookies from 'js-cookie';

const BASE_URL = 'http://localhost:4000';

const enum AuthApi {
  signin = '/auth/signin',
  signup = '/auth/signup',
  logout = '/auth/logout',
  refresh = '/auth/refresh',
  protected = '/auth/protected',
  csrf = '/auth/csrf',
  user = '/auth/user',
}

export const apiClient = axios.create({ 
  baseURL: BASE_URL,  
});

const setAuthorizationHeader = (token: string) => {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

apiClient.interceptors.request.use((config) => {     
  return {
    ...config,
    headers: {
      ...config.headers,
      'XSRF-TOKEN': Cookies.get('X-CSRF') || ''
    }
  }
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use((res) => res, async function (error: AxiosError) {  
  if (error?.response?.status === 401) {
    const body = await postRefresh();
    return apiClient.request({ 
      ...error.config,  
      headers: {
        Authorization: `Bearer ${body.data.accessToken}`
      }
    });
  }
  
  return Promise.reject(error);
});

export const getCSRF = () => {
  return apiClient.get(AuthApi.csrf)
}

export const postSignUp = (data?: any) => {
  return apiClient.post(AuthApi.signup, data)
}

export const postSignIn = async (data?: any) => {
  const body = await apiClient.post(AuthApi.signin, data, {
    withCredentials: true,
  });
  setAuthorizationHeader(body.data.accessToken)
  return body;
}

export const postLogout = (data?: any) => {
  return apiClient.post(AuthApi.logout, data).then(() => {
    setAuthorizationHeader('')
    Cookies.remove('RefreshToken')
  })
}

export const postRefresh = async (data?: any, config?: any) => {
  const body = await apiClient.post(AuthApi.refresh, data, config || { withCredentials: true });
  setAuthorizationHeader(body.data.accessToken)
  return body;
}

export const getProtected = () => {
  return apiClient.get(AuthApi.protected)
}

export const getUser = () => {
  return apiClient.get(AuthApi.user, {
  })
}
