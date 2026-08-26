import { createRef } from 'react';

import {
  CommonActions,
  NavigationContainerRef,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../interface/common';
import { localStore } from '../api/constants';

export const navigationRef =
  createRef<NavigationContainerRef<RootStackParamList>>();

export const getAsyncStorage = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
};

export const setAsyncStorage = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // ignore storage write failures
  }
};

export const removeAsyncStorage = async () => {
  try {
    await AsyncStorage.removeMany(Object.values(localStore));
  } catch {
    // ignore storage clear failures
  }
};

export const isValidEmail = (email: string) => {
  const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return emailPattern.test(email);
};

export const capitalizeFirstLetter = (text = '') => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Hello, Good Morning';
  if (hour < 17) return 'Hello, Good Afternoon';
  return 'Hello, Good Evening';
};

export const resetStack = (name: string, params?: any) =>
  //@ts-ignore
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: name, params: params }],
    }),
  );

export const getCurrentRouteName = () => {
  return navigationRef.current?.getCurrentRoute()?.name;
};
