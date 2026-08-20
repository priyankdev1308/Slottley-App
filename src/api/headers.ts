import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const APP_SECRET = 'NEXTLEVELHUB@47';
const APP_TRACK_VERSION = 'v1';

/**
 * Headers every request to the NextLevelHub API must carry, regardless
 * of which axios client (axiosInstance.ts / global.ts) sends it.
 */
export const getCommonHeaders = () => ({
  'App-Track-Version': APP_TRACK_VERSION,
  'App-Device-Type': Platform.OS === 'ios' ? 'iOS' : 'Android',
  'App-Store-Version': DeviceInfo.getVersion(),
  'App-Device-Model': DeviceInfo.getModel(),
  'App-Os-Version': DeviceInfo.getSystemVersion(),
  'App-Secret': APP_SECRET,
  'App-Store-Build-Number': DeviceInfo.getBuildNumber(),
  'Content-Type': 'application/json',
});
