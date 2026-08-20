import { GET_NOTIFICATION } from '../types';

const initialState = {
  notification: null,
};

export const notificationReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case GET_NOTIFICATION:
      return {
        ...state,
        notification: action.payload,
      };
    default:
      return state;
  }
};
