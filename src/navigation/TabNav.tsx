import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabScreenProps,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import TabBar, { TabKey } from '../components/TabBar';
import HomeScreen from '../screens/HomeScreen';
import HostHomeScreen from '../screens/HostHomeScreen';
import JobScreen from '../screens/JobScreen';
import HostMyJobScreen from '../screens/HostMyJobScreen';
import BookingScreen from '../screens/BookingScreen';
import HostMyBookingScreen from '../screens/HostMyBookingScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { RootStackParamList } from '../interface/common';
import { colors } from '../utils/colors';

export type SpaceRole = 'renter' | 'host';

export type MainTabParamList = {
  Explore: undefined;
  Job: undefined;
  Booking: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

type TabNavProps = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNav = ({ route }: TabNavProps) => {
  const userRole: SpaceRole = route.params?.userRole ?? 'renter';
  const initialTab = route.params?.initialTab ?? 'Explore';

  const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => (
    <TabBar
      active={state.routeNames[state.index] as TabKey}
      userRole={userRole}
      onTabPress={(tab: TabKey) => navigation.navigate(tab)}
    />
  );

  return (
    <Tab.Navigator
      initialRouteName={initialTab}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.screenBgColor },
      }}
      tabBar={CustomTabBar}
    >
      <Tab.Screen
        name="Explore"
        component={userRole === 'host' ? HostHomeScreen : HomeScreen}
      />
      <Tab.Screen
        name="Job"
        component={userRole === 'host' ? HostMyJobScreen : JobScreen}
      />
      <Tab.Screen
        name="Booking"
        component={userRole === 'host' ? HostMyBookingScreen : BookingScreen}
      />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNav;
