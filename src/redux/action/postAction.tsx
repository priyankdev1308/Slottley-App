import { api, DELETE, GET, PATCH, POST, PUT } from '../../api/apiConsts';
import { makeAPIRequest } from '../../api/global';

export const getPostById =
  (
    request: {
      onSuccess(response: any): unknown;
      onFail(error: any): unknown;
      data: {} | any;
    },
    postId: string,
  ) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: GET,
      url: `${api.getPost}/${postId}`,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) {
          //   dispatch(getCourses(response?.data?.data));
          request.onSuccess(response);
        }
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const deletePost =
  (
    request: {
      onSuccess(response: any): unknown;
      onFail(error: any): unknown;
      data: {} | any;
    },
    postId: string,
  ) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: DELETE,
      url: `${api.post}/${postId}`,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) {
          //   dispatch(getCourses(response?.data?.data));
          request.onSuccess(response);
        }
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const deleteComment =
  (
    request: {
      onSuccess(response: any): unknown;
      onFail(error: any): unknown;
      data: {} | any;
    },
    commmentId: string,
  ) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: DELETE,
      url: `${api.deleteComment}/${commmentId}`,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) {
          //   dispatch(getCourses(response?.data?.data));
          request.onSuccess(response);
        }
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const deleteReply =
  (
    request: {
      onSuccess(response: any): unknown;
      onFail(error: any): unknown;
      data: {} | any;
    },
    commmentId: string,
  ) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: DELETE,
      url: `${api.deleteReply}/${commmentId}`,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) {
          //   dispatch(getCourses(response?.data?.data));
          request.onSuccess(response);
        }
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const editComment =
  (
    request: {
      onSuccess(response: any): unknown;
      onFail(error: any): unknown;
      data: {} | any;
    },
    commmentId: string,
  ) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: PATCH,
      url: `${api.updateComment}/${commmentId}`,
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

export const editReply =
  (
    request: {
      onSuccess(response: any): unknown;
      onFail(error: any): unknown;
      data: {} | any;
    },
    commmentId: string,
  ) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: PATCH,
      url: `${api.updateReply}/${commmentId}`,
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

export const editPost =
  (
    request: {
      onSuccess(response: any): unknown;
      onFail(error: any): unknown;
      data: {} | any;
    },
    postId: string,
  ) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: PUT,
      url: `${api.post}/${postId}`,
      data: request.data,
      isFormData: true,
    })
      .then((response: any) => {
        if (request.onSuccess) {
          //   dispatch(getCourses(response?.data?.data));
          request.onSuccess(response);
        }
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const createPost =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: POST,
      url: api.createPost,
      data: request.data,
      isFormData: true,
    })
      .then((response: any) => {
        if (request.onSuccess) {
          //   dispatch(getCourses(response?.data?.data));
          request.onSuccess(response);
        }
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const addCommentToPost =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: POST,
      url: api.addComment,
      data: request.data,
      isFormData: true,
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

export const addReplyToComment =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: POST,
      url: api.addReplyComment,
      data: request.data,
      isFormData: true,
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

export const addLikeDislikeToPost =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: POST,
      url: api.likeDislike,
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
