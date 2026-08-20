import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';
import InAppReview from 'react-native-in-app-review';

const KEY = 'APP_OPEN_COUNT';

export const requestReviewIfNeeded = async () => {
  try {
    const value = await AsyncStorage.getItem(KEY);
    const count = value ? Number(value) + 1 : 1;

    await AsyncStorage.setItem(KEY, count.toString());
    console.log('councountcountcountt', count);
    if (count % 5 === 0 && InAppReview.isAvailable()) {
      InAppReview.RequestInAppReview();
    }
  } catch (e) {
    console.log('Review error', e);
  }
};

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.myfinancialtrading.app';

const APP_STORE_URL = 'https://apps.apple.com/app/id6747272323';

export const rateApp = async () => {
  if (InAppReview.isAvailable()) {
    try {
      await InAppReview.RequestInAppReview();
      return;
    } catch { }
  }
  const url = Platform.OS === 'android' ? PLAY_STORE_URL : APP_STORE_URL;
  Linking.openURL(url);
};
