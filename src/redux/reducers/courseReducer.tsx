import { GET_COURSES } from '../types';

const initialState = {
  course: null,
};

export const courseReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case GET_COURSES:
      return {
        ...state,
        course: action.payload,
      };
    default:
      return state;
  }
};
