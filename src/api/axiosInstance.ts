// api/axiosInstance.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getEnvVars } from './config';
import { localStore } from './constants';
import {
  getAsyncStorage,
  setAsyncStorage,
  removeAsyncStorage,
  resetStack,
} from '../helpers/globalFunctions';
import ToastAlert from '../components/ToastAlert';
import { screens } from '../navigation/routes/screens';
import { api } from './apiConsts';
import { getCommonHeaders } from './headers';
// import { api } from './apiRoutes'; // your API endpoints

const BASE_URL = getEnvVars()?.base_url;

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async config => {
    Object.entries(getCommonHeaders()).forEach(([key, value]) => {
      if (config.headers[key] === undefined) {
        config.headers[key] = value;
      }
    });

    const token = await getAsyncStorage(localStore.token);
    if (token) {
      config.headers['Auth-Token'] = token;
    }
    return config;
  },
  error => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    // If token expired or unauthorized
    if (
      (status === 401 || message?.includes('jwt expired')) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers!['Auth-Token'] = token;
              resolve(axiosInstance(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      isRefreshing = true;

      const refreshToken = await getAsyncStorage(localStore.refreshToken);

      if (!refreshToken) {
        removeAsyncStorage();
        resetStack(screens.LoginScreen);
        ToastAlert({
          title: 'Session Expired',
          toastType: 'error',
          description: 'Please login again',
        });
        return Promise.reject(error);
      }

      try {
        // Service.php routes every request through a `Service` query param
        // rather than a REST path.
        const res = await axios.patch(`${BASE_URL}?Service=${api.getToken}`, {
          refreshToken,
        });

        const newAccessToken = res.data?.data?.accessToken;
        if (newAccessToken) {
          await setAsyncStorage(localStore.token, newAccessToken);
          axiosInstance.defaults.headers['Auth-Token'] = newAccessToken;
          processQueue(null, newAccessToken);
          originalRequest.headers!['Auth-Token'] = newAccessToken;
          return axiosInstance(originalRequest);
        } else {
          throw new Error('No new token received');
        }
      } catch (err) {
        processQueue(err, null);
        removeAsyncStorage();
        resetStack(screens.LoginScreen);
        ToastAlert({
          title: 'Session Expired',
          toastType: 'error',
          description: 'Please login again',
        });
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
