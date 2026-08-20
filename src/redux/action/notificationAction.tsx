import { api, DELETE, GET, PUT } from '../../api/apiConsts';
import { makeAPIRequest } from '../../api/global';
import { getNotifications } from './userAction';

export const getNotification =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: GET,
      url: `${api.notification}`,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) {
          dispatch(getNotifications(response?.data?.data));
          request.onSuccess(response);
        }
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const readNotification =
  (
    request: {
      onSuccess(response: any): unknown;
      onFail(error: any): unknown;
      data: {} | any;
    },
    id: string,
  ) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: PUT,
      url: `${api.notification}/${id}`,
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

export const deleteNotification =
  (
    request: {
      onSuccess(response: any): unknown;
      onFail(error: any): unknown;
      data: {} | any;
    },
    id: string,
  ) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: DELETE,
      url: `${api.notification}/${id}`,
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
