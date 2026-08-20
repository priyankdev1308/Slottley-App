import axios from 'axios';
import { Alert } from 'react-native';

import { getEnvVars } from './config';
import { localStore } from './constants';
import { api, PATCH } from './apiConsts';
import ToastAlert from '../components/ToastAlert';
import { screens } from '../navigation/routes/screens';
import {
  resetStack,
  getAsyncStorage,
  setAsyncStorage,
  removeAsyncStorage,
  getCurrentRouteName,
} from '../helpers/globalFunctions';
import { getCommonHeaders } from './headers';

let isRefreshing = false;
let failedQueue: any[] = [];
let isForceLoggingOut = false;

// This backend can flag `force_logout: 1` in the JSON body of *any* API
// response (not just auth ones) — e.g. an expired token detected mid-request,
// while still returning HTTP 200 with a logical-failure body (see
// extractApiError). Checked centrally here so every screen's call through
// makeAPIRequest gets the same handling without each one checking for it.
const handleForceLogout = async (data: any) => {
  const forceLogout = data?.force_logout;
  const isForceLogout = forceLogout === 1 || forceLogout === '1';
  if (!isForceLogout || isForceLoggingOut) return isForceLogout;

  isForceLoggingOut = true;
  try {
    if (getCurrentRouteName() !== screens.LoginScreen) {
      await removeAsyncStorage();
      resetStack(screens.LoginScreen);
    }
    Alert.alert(
      'Session Expired',
      data?.msg || data?.message || 'Your session has expired. Please login again.',
    );
  } finally {
    isForceLoggingOut = false;
  }
  return isForceLogout;
};

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

const apiClient = axios.create({
  baseURL: getEnvVars()?.base_url,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async config => {
    // A FormData body needs axios/RN to set its own multipart boundary in
    // Content-Type — forcing 'application/json' here would break the upload.
    // The axios instance itself defaults to 'application/json' (see
    // axios.create above), so it must be explicitly removed, not just
    // skipped when merging in the common headers below.
    const isMultipart = config.data instanceof FormData;
    if (isMultipart) {
      delete config.headers['Content-Type'];
    }
    Object.entries(getCommonHeaders()).forEach(([key, value]) => {
      if (isMultipart && key === 'Content-Type') return;
      if (config.headers[key] === undefined) {
        config.headers[key] = value;
      }
    });

    const token = await getAsyncStorage(localStore.token);
    if (token) {
      config.headers['Auth-Token'] = `${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  async response => {
    await handleForceLogout(response.data);
    return response;
  },
  async error => {
    const originalRequest = error.config;

    if (await handleForceLogout(error.response?.data)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const errMessage = error.response?.data?.message?.toLowerCase() || '';
    const isTokenExpired =
      errMessage.includes('expired') ||
      error.response?.data?.err?.name === 'TokenExpiredError';

    if (
      (status === 401 || status === 500) &&
      isTokenExpired &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await getAsyncStorage(localStore.refreshToken);
      if (!refreshToken) {
        if (getCurrentRouteName() !== screens.LoginScreen) {
          removeAsyncStorage();
          resetStack(screens.LoginScreen);
        }
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        makeAPIRequest({
          method: PATCH,
          url: api.getToken,
          data: { refreshToken },
        })
          .then((response: any) => {
            const { accessToken, refreshToken: newRefreshToken } =
              response.data;

            setAsyncStorage(localStore.token, accessToken);
            if (newRefreshToken) {
              setAsyncStorage(localStore.refreshToken, newRefreshToken);
            }

            apiClient.defaults.headers.common.Authorization = `${accessToken}`;
            originalRequest.headers.Authorization = `${accessToken}`;

            processQueue(null, accessToken);
            resolve(apiClient(originalRequest));
          })
          .catch(err => {
            processQueue(err, null);

            if (getCurrentRouteName() !== screens.LoginScreen) {
              removeAsyncStorage();
              resetStack(screens.LoginScreen);
            }

            ToastAlert({
              title: 'Session Expired',
              toastType: 'error',
              description: err.response?.data?.message || 'Please login again',
            });

            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    if (status === 401) {
      console.log('error.responseerror.response', error.response.data.message);
      if (isTokenExpired) {
        if (getCurrentRouteName() !== screens.LoginScreen) {
          removeAsyncStorage();
          resetStack(screens.LoginScreen);
        }
        ToastAlert({
          title: 'Session Expired',
          toastType: 'error',
          description: 'Please login again',
        });
      } else if (
        status === 401 &&
        error.response.data.message == 'Invalid token!'
      ) {
        ToastAlert({
          title: 'Oops',
          toastType: 'error',
          description: error.response?.data?.message || 'Invalid token!',
        });
        if (getCurrentRouteName() !== screens.LoginScreen) {
          removeAsyncStorage();
          resetStack(screens.LoginScreen);
        }
      } else if (
        status === 401 &&
        error.response.data.message == 'You are not authorized!'
      ) {
        ToastAlert({
          title: 'Oops',
          toastType: 'error',
          description:
            error.response?.data?.message || 'You are not authorized!',
        });
        if (getCurrentRouteName() !== screens.LoginScreen) {
          removeAsyncStorage();
          resetStack(screens.LoginScreen);
        }
      } else {
        ToastAlert({
          title: 'Incorrect Password',
          toastType: 'error',
          description:
            error.response?.data?.message || 'Wrong credentials provided!',
        });
      }
    } else if (status === 400 || status === 404) {
      ToastAlert({
        title: 'Oops',
        toastType: 'error',
        description: error.response?.data?.message || 'Something went wrong!',
      });
    } else {
      ToastAlert({
        title: 'Oops',
        toastType: 'error',
        description: error.response?.data?.message || 'Something went wrong!',
      });
    }

    return Promise.reject(error);
  },
);

export const makeAPIRequest = ({
  method,
  url,
  data = {},
  params,
  isFormData,
}: {
  method?: string;
  url?: string;
  data?: any;
  params?: any;
  isFormData?: boolean;
}) => {
  const headers: Record<string, string> = { 'x-client-type': 'app' };
  console.log(params);
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // NextLevelHub's backend routes every request through a single Service.php
  // endpoint, selected via a `Service` query param rather than a REST path.
  // FormData has no enumerable keys, so Object.keys(data).length would always
  // be 0 for it — send it through untouched instead of dropping the body.
  return apiClient({
    method,
    url: '',
    data: isFormData ? data : Object.keys(data).length !== 0 ? data : undefined,
    params: { ...params, Service: url },
    headers,
  })
    .then(response => {
      console.log('responseresponseresponse', response);
      if (response.status === 200 || response.status === 201) {
        return response;
      }
      throw response;
    })
    .catch(error => {
      console.log('errorerrorerrorerrorerrorerror', error?.response);
      throw error;
    });
};
