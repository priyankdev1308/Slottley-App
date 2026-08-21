import React, { useEffect, useState } from 'react';
import { View, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { navigationRef } from '../helpers/globalFunctions';
import { RootStackParamList } from '../interface/common';
import { colors } from '../utils/colors';
import { supabase } from '../api/supabaseClient';
import ToastAlert from '../components/ToastAlert';
import { screens } from './routes/screens';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import FilterScreen from '../screens/FilterScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import BookPlaceScreen from '../screens/BookPlaceScreen';
import RentAgreementScreen from '../screens/RentAgreementScreen';
import PaymentScreen from '../screens/PaymentScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import JobApplyScreen from '../screens/JobApplyScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import WishlistScreen from '../screens/WishlistScreen';
import MyJobApplicationsScreen from '../screens/MyJobApplicationsScreen';
import GetVerifiedScreen from '../screens/GetVerifiedScreen';
import ReferEarnScreen from '../screens/ReferEarnScreen';
import MyCardsScreen from '../screens/MyCardsScreen';
import AddNewCardScreen from '../screens/AddNewCardScreen';
import NotificationScreen from '../screens/NotificationScreen';
import TabNav from './TabNav';

const Stack = createNativeStackNavigator<RootStackParamList>();

const extractRecoveryCode = (url: string | null | undefined) => {
  if (!url) return null;
  try {
    return new URL(url).searchParams.get('code');
  } catch {
    return null;
  }
};

const StackNav = () => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const [pendingResetCode, setPendingResetCode] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setInitialRoute(data.session ? 'MainTabs' : (screens.LoginScreen as keyof RootStackParamList));
    });
  }, []);

  // Catches the password-reset email link (slottley://reset-password?code=...)
  // on both cold start (app opened by the link) and warm start (app already
  // running). The actual code exchange waits until the navigator below has
  // mounted — see the next effect.
  useEffect(() => {
    const handleIncomingUrl = (url: string | null | undefined) => {
      if (!url) return;
      const code = extractRecoveryCode(url);
      if (code) {
        setPendingResetCode(code);
      } else {
        // TEMP diagnostic: a deep link came in but we couldn't find a
        // `code` param — shows us the real link shape instead of guessing.
        ToastAlert({ title: 'Deep link received', description: url });
      }
    };

    Linking.getInitialURL().then(handleIncomingUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => handleIncomingUrl(url));

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!pendingResetCode || !initialRoute) return;

    supabase.auth.exchangeCodeForSession(pendingResetCode).then(({ error }) => {
      setPendingResetCode(null);
      if (error) {
        ToastAlert({ title: 'Reset link failed', description: error.message });
        return;
      }
      navigationRef.current?.navigate('ResetPasswordScreen');
    });
  }, [pendingResetCode, initialRoute]);

  if (!initialRoute) {
    return <View style={{ flex: 1, backgroundColor: colors.primary }} />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          navigationBarColor: colors.primary,
          contentStyle: { backgroundColor: colors.screenBgColor },
        }}
      >
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen
          name="ForgotPasswordScreen"
          component={ForgotPasswordScreen}
        />
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
        <Stack.Screen name="MainTabs" component={TabNav} />
        <Stack.Screen
          name="FilterScreen"
          component={FilterScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="PlaceDetailScreen" component={PlaceDetailScreen} />
        <Stack.Screen name="BookPlaceScreen" component={BookPlaceScreen} />
        <Stack.Screen name="RentAgreementScreen" component={RentAgreementScreen} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen
          name="BookingConfirmationScreen"
          component={BookingConfirmationScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="JobDetailScreen" component={JobDetailScreen} />
        <Stack.Screen name="JobApplyScreen" component={JobApplyScreen} />
        <Stack.Screen name="ChatDetailScreen" component={ChatDetailScreen} />
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
        <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
        <Stack.Screen name="WishlistScreen" component={WishlistScreen} />
        <Stack.Screen
          name="MyJobApplicationsScreen"
          component={MyJobApplicationsScreen}
        />
        <Stack.Screen name="GetVerifiedScreen" component={GetVerifiedScreen} />
        <Stack.Screen name="ReferEarnScreen" component={ReferEarnScreen} />
        <Stack.Screen name="MyCardsScreen" component={MyCardsScreen} />
        <Stack.Screen
          name="AddNewCardScreen"
          component={AddNewCardScreen}
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNav;
