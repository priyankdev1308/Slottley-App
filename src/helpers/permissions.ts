import { PermissionsAndroid, Platform } from 'react-native';

// AndroidManifest.xml declares android.permission.CAMERA (needed elsewhere in
// the app), which means Android requires it to be explicitly requested and
// granted at runtime before ANY camera use — otherwise react-native-image-picker's
// launchCamera throws "This library does not require Manifest.permission.CAMERA,
// if you add this permission in manifest then you have to obtain the same."
// iOS handles this itself via Info.plist's NSCameraUsageDescription and doesn't
// need (or have) this runtime request step.
export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Camera Permission',
      message: 'This app needs access to your camera to take a photo.',
      buttonPositive: 'OK',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};
