import { combineReducers } from 'redux';
import { userReducer } from './userReducer';
import { courseReducer } from './courseReducer';
import { communityReducer } from './communityReducer';
import { notificationReducer } from './notificationReducer';

const rootReducer = combineReducers<any>({
  user: userReducer,
  course: courseReducer,
  community: communityReducer,
  notification: notificationReducer,
});

export default (state: any, action: any) => {
  // if (action.type === 'LOGOUT') {
  //   return rootReducer(undefined, action)
  // }
  return rootReducer(state, action);
};
