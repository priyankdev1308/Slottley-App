import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { navigationRef } from '../helpers/globalFunctions';
import { RootStackParamList } from '../interface/common';
import { colors } from '../utils/colors';
import { screens } from './routes/screens';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
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
import TabNav from './TabNav';

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNav = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={screens.LoginScreen as keyof RootStackParamList}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNav;
