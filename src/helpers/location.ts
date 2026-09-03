import { Linking, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export type LocationResult =
  | { granted: true; latitude: number; longitude: number }
  | { granted: false; canAskAgain: boolean };

const getCurrentPosition = (): Promise<LocationResult> =>
  new Promise(resolve => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          granted: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        // iOS never re-shows its system prompt once denied — any error here
        // (bar a genuine timeout) means the user has to go to Settings.
        resolve({ granted: false, canAskAgain: error.code === error.TIMEOUT });
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    );
  });

// Android requires an explicit runtime request before location can be read
// at all; iOS shows its own system prompt the first time getCurrentPosition
// is called, using Info.plist's NSLocationWhenInUseUsageDescription.
export const requestLocationPermission = async (): Promise<LocationResult> => {
  if (Platform.OS === 'android') {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Slottley uses your location to show spaces near you.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    if (status !== PermissionsAndroid.RESULTS.GRANTED) {
      return { granted: false, canAskAgain: status !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN };
    }
  }

  return getCurrentPosition();
};

export const openLocationSettings = () => Linking.openSettings();
