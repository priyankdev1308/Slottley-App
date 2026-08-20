import { CLEAR_USER_PROFILE, SET_USER_PROFILE } from '../types';

const initialState = {
  profile: null,
};

export const userReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_USER_PROFILE:
      return {
        ...state,
        profile: action.payload,
      };
    case CLEAR_USER_PROFILE:
      return {
        ...state,
        profile: null,
      };
    default:
      return state;
  }
};
