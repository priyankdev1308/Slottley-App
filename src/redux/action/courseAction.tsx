import { api, GET } from '../../api/apiConsts';
import { makeAPIRequest } from '../../api/global';
import { getCourses } from './userAction';

export const getAllCourses =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: GET,
      url: api.courses,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) {
          dispatch(getCourses(response?.data?.data));
          request.onSuccess(response);
        }
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const liveVideo =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: GET,
      url: api.liveVideo,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) {
          request.onSuccess(response);
        }
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const getVideoById =
  (
    request: {
      onSuccess(response: any): unknown;
      onFail(error: any): unknown;
      data: {} | any;
    },
    id: any,
  ) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: GET,
      url: `${api.getVideoById}/${id}`,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) {
          request.onSuccess(response);
        }
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const playVideo =
  (
    request: {
      onSuccess?(response: any): void;
      onFail?(error: any): void;
      data?: any;
    },
    videoToken: string,
  ) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: GET,
      url: `${api.playVideo}${videoToken}`,
      videoToken: videoToken,
      data: request?.data ?? {},
    })
      .then((response: any) => {
        request?.onSuccess?.(response);
      })
      .catch(error => {
        request?.onFail?.(error);
      });
  };
