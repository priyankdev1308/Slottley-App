import { api, DELETE, GET, PATCH, POST, PUT } from '../../api/apiConsts';
import { makeAPIRequest } from '../../api/global';
import { setUserProfile } from './userAction';

export const registerUser =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async () => {
    return makeAPIRequest({
      method: POST,
      url: api.register,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) request.onSuccess(response);
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const registerIOSUser =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async () => {
    return makeAPIRequest({
      method: POST,
      url: api.registerForIos,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) request.onSuccess(response);
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const updateNewTag =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async () => {
    return makeAPIRequest({
      method: PATCH,
      url: api.updateNewTag,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) request.onSuccess(response);
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const loginUser =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async () => {
    return makeAPIRequest({
      method: POST,
      url: api.login,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) request.onSuccess(response);
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const getMyProfile =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: GET,
      url: api.myProfile,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) {
          dispatch(setUserProfile(response?.data?.data));
          request.onSuccess(response);
        }
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const deleteAccount =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: DELETE,
      url: api.deleteAccount,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) {
          dispatch(setUserProfile(response?.data?.data));
          request.onSuccess(response);
        }
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const otpVerification =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async () => {
    return makeAPIRequest({
      method: PATCH,
      url: api.otp,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) request.onSuccess(response);
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const forgotPassOtpVerification =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async () => {
    return makeAPIRequest({
      method: POST,
      url: api.forgotOtpVerify,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) request.onSuccess(response);
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const resendOtp =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async () => {
    return makeAPIRequest({
      method: PATCH,
      url: api.resendOtp,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) request.onSuccess(response);
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const editProfile =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async (dispatch: any) => {
    return makeAPIRequest({
      method: PATCH,
      url: api.editProfile,
      data: request.data,
      isFormData: true,
    })
      .then((response: any) => {
        if (request.onSuccess) {
          dispatch(setUserProfile(response?.data?.data));
          request.onSuccess(response);
        }
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const subscribeToLetter =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async () => {
    return makeAPIRequest({
      method: POST,
      url: api.subscribeLetter,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) request.onSuccess(response);
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const forgotPassword =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async () => {
    return makeAPIRequest({
      method: POST,
      url: api.forgotPassword,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) request.onSuccess(response);
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const resetPassword =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async () => {
    return makeAPIRequest({
      method: POST,
      url: api.resetPassword,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) request.onSuccess(response);
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const logoutUser =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async () => {
    return makeAPIRequest({
      method: POST,
      url: api.logout,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) request.onSuccess(response);
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const getAccessToken =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async () => {
    return makeAPIRequest({
      method: PATCH,
      url: api.getToken,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) request.onSuccess(response);
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const changeThePassword =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async () => {
    return makeAPIRequest({
      method: PUT,
      url: api.changePassword,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) request.onSuccess(response);
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };

export const getThePlans =
  (request: {
    onSuccess(response: any): unknown;
    onFail(error: any): unknown;
    data: {} | any;
  }) =>
  async () => {
    return makeAPIRequest({
      method: GET,
      url: api.plans,
      data: request.data,
    })
      .then((response: any) => {
        if (request.onSuccess) request.onSuccess(response);
      })
      .catch(error => {
        if (request.onFail) request.onFail(error);
      });
  };
