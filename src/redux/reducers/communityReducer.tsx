import { GET_ALL_COMMUNITY } from '../types';

const initialState = {
  community: null,
};

export const communityReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case GET_ALL_COMMUNITY:
      return {
        ...state,
        community: action.payload,
      };
    // case CLEAR_USER_PROFILE:
    //   return {
    //     ...state,
    //     profile: null,
    //   };
    default:
      return state;
  }
};
