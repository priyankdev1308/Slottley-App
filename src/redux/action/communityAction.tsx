import { api, GET } from '../../api/apiConsts';
import { makeAPIRequest } from '../../api/global';
import { getAllCommunityList } from './userAction';

export const getAllCommunity =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: GET,
      url: api.community,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) {
          dispatch(getAllCommunityList(response?.data?.data));
          request.onSuccess(response);
        }
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const getCommunityBySlug =
  (
    request: {
      onSuccess(response: any): unknown;
      onFail(error: any): unknown;
      data: {} | any;
    },
    slug: string,
  ) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: GET,
      url: `${api.community}/${slug}`,
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

export const getPostyBySlug =
  (
    request: {
      onSuccess(response: any): unknown;
      onFail(error: any): unknown;
      data: { page?: number; limit?: number } | any;
    },
    slug: string,
  ) =>
  async (dispatch: any) => {
    const params = new URLSearchParams();
    if (request.data) {
      Object.keys(request.data).forEach(key => {
        if (request.data[key] !== undefined && request.data[key] !== null) {
          params.append(key, String(request.data[key]));
        }
      });
    }
    const queryString = params.toString();
    const url = queryString
      ? `${api.getPostBySlug}/${slug}?${queryString}`
      : `${api.getPostBySlug}/${slug}`;

    return makeAPIRequest({
      method: GET,
      url: url,
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

export const getPostyBySlugAlternative =
  (
    request: {
      onSuccess(response: any): unknown;
      onFail(error: any): unknown;
      data: { page?: number; limit?: number } | any;
    },
    slug: string,
  ) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: GET,
      url: `${api.getPostBySlug}/${slug}`,
      params: request.data,
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

export const getMarketResearchPost =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: { page?: number; limit?: number } | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: GET,
      url: `${api.marketResearch}`,
      params: request.data,
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
