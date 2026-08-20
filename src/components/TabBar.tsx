import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import type { SpaceRole } from '../navigation/TabNav';

export type TabKey = 'Explore' | 'Job' | 'Booking' | 'Chat' | 'Profile';

interface TabItem {
  key: TabKey;
  label: string;
  icon: ImageSourcePropType;
}

// "Explore"/"Job" tab labels change based on the role picked at registration —
// a Find Space user browses/applies, a List Space user manages their own.
const getTabs = (userRole: SpaceRole): TabItem[] => [
  {
    key: 'Explore',
    label: userRole === 'list' ? 'Home' : 'Explore',
    icon: icons.tabExplore,
  },
  {
    key: 'Job',
    label: userRole === 'list' ? 'My Job' : 'Job',
    icon: icons.tabJob,
  },
  { key: 'Booking', label: 'Booking', icon: icons.tabBooking },
  { key: 'Chat', label: 'Chat', icon: icons.tabChat },
  { key: 'Profile', label: 'Profile', icon: icons.tabProfile },
];

interface TabBarProps {
  active: TabKey;
  userRole?: SpaceRole;
  onTabPress?: (tab: TabKey) => void;
}

const TabBar = ({ active, userRole = 'find', onTabPress }: TabBarProps) => {
  const insets = useSafeAreaInsets();
  const tabs = getTabs(userRole);

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, hp(14)) },
      ]}
    >
      {tabs.map(tab => {
        const isActive = tab.key === active;
        const tint = isActive ? colors.primary : colors.gray5E6977;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            style={styles.tab}
            onPress={() => onTabPress?.(tab.key)}
          >
            <Image
              source={tab.icon}
              style={[styles.icon, { tintColor: tint }]}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.label,
                { color: tint },
                isActive && styles.labelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopLeftRadius: wp(24),
    borderTopRightRadius: wp(24),
    paddingTop: hp(14),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    width: wp(24),
    height: wp(24),
    marginBottom: hp(6),
  },
  label: {
    fontSize: fontSize(11.5),
    fontFamily: fonts.Lato400,
  },
  labelActive: {
    fontFamily: fonts.Lato700,
  },
});
