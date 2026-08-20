import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';

interface AuthTabsProps {
  active: 'login' | 'register';
  onLogin: () => void;
  onRegister: () => void;
}

const AuthTabs = ({ active, onLogin, onRegister }: AuthTabsProps) => {
  const isLogin = active === 'login';

  return (
    <View style={styles.track}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onLogin}
        style={[styles.tab, isLogin && styles.activeTab]}
      >
        <Text style={[styles.tabText, isLogin && styles.activeText]}>
          Sign In
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onRegister}
        style={[styles.tab, !isLogin && styles.activeTab]}
      >
        <Text style={[styles.tabText, !isLogin && styles.activeText]}>
          Register
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthTabs;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.sage,
    borderRadius: wp(14),
    padding: wp(4),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(13),
    borderRadius: wp(10),
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.primary,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  activeText: {
    color: colors.white,
  },
});
