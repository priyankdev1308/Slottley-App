import { Platform, Dimensions } from 'react-native';
import {
  widthPercentageToDP,
  heightPercentageToDP,
} from 'react-native-responsive-screen';
import DeviceInfo from 'react-native-device-info';
import { RFValue } from 'react-native-responsive-fontsize';

export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const wp = (val: number) => {
  const baseWidth = screenWidth < BASE_WIDTH ? BASE_WIDTH : screenWidth;
  return widthPercentageToDP((val * 100) / baseWidth);
};

export const hp = (val: number) => {
  const baseHeight = screenHeight < BASE_HEIGHT ? BASE_HEIGHT : screenHeight;
  return heightPercentageToDP((val * 100) / baseHeight);
};

export const fontSize = (val: number) => RFValue(val, screenHeight);

export const isIos = Platform.OS === 'ios';

export const isTab = DeviceInfo.isTablet();

export const deviceType = isIos ? 'ios' : 'android';
