import axios from 'axios'
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken'

const BASE_URL = 'http://localhost:4000';

const enum AuthApi {
  signin = '/auth/signin',
  signup = '/auth/signup',
  logout = '/auth/logout',
  refresh = '/auth/refresh',
  protected = '/auth/protected',
  csrf = '/auth/csrf',
  github = '/auth/github',
}

export let accessToken = '';

const apiClient = axios.create({ 
  baseURL: BASE_URL
});

apiClient.interceptors.request.use((config) => {    
  return {
    ...config,
    withCredentials: true,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
      'XSRF-TOKEN': Cookies.get('X-CSRF') || ''
    }
  }
}, (error) => {
  console.error(error);
  return Promise.reject(error);
});

export const getCSRF = () => {
  return apiClient.get(AuthApi.csrf)
}

export const postSignUp = (data?: any) => {
  return apiClient.post(AuthApi.signup, data)
}

export const postSignIn = async (data?: any) => {
  const body = await apiClient.post(AuthApi.signin, data);
  accessToken = body.data.accessToken;

  return body;
}

export const postLogout = (data?: any) => {
  return apiClient.post(AuthApi.logout, data).then(() => {
    accessToken = '';
  })
}

export const postRefresh = async (data?: any) => {
  const body = await apiClient.post(AuthApi.refresh, data);
  accessToken = body.data.accessToken;
  console.log(jwt.decode(accessToken));
  return body;
}

export const getProtected = () => {
  return apiClient.get(AuthApi.protected)
}

export const getSignUpGithub = () => {
  return apiClient.get(AuthApi.github, {
  })
}
