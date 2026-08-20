import {
  CLEAR_USER_PROFILE,
  GET_ALL_COMMUNITY,
  GET_COURSES,
  GET_NOTIFICATION,
  SET_USER_PROFILE,
} from '../types';
export const setUserProfile = (profile: any) => ({
  type: SET_USER_PROFILE,
  payload: profile,
});
export const getAllCommunityList = (profile: any) => ({
  type: GET_ALL_COMMUNITY,
  payload: profile,
});

export const getCourses = (course: any) => ({
  type: GET_COURSES,
  payload: course,
});

export const getNotifications = (data: any) => ({
  type: GET_NOTIFICATION,
  payload: data,
});

export const clearUserProfile = () => ({
  type: CLEAR_USER_PROFILE,
});
