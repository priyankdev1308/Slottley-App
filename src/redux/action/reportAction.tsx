import { api, POST } from '../../api/apiConsts';
import { makeAPIRequest } from '../../api/global';

export const reportPost =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: POST,
      url: api.reportPost,
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

export const reportComment =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: POST,
      url: api.reportComment,
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

export const reportReply =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: POST,
      url: api.reportReply,
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
