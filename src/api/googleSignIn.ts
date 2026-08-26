import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '@env';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
});

// Runs the native Google account picker and returns the ID token Supabase
// needs to complete the sign-in — null if the user backed out of the
// picker rather than an actual failure.
export const getGoogleIdToken = async (): Promise<string | null> => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (response.type === 'cancelled') return null;
    return response.data.idToken;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
      return null;
    }
    throw error;
  }
};

// Clears the cached native Google session — used when a Google identity
// doesn't have a completed app registration, so the next attempt shows the
// account picker again instead of silently re-using this sign-in.
export const signOutGoogle = () => GoogleSignin.signOut();
