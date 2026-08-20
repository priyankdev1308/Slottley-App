import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ImageSourcePropType,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { MainTabScreenProps } from '../navigation/TabNav';

interface ProfileOption {
  key: string;
  icon: ImageSourcePropType;
  title: string;
  danger?: boolean;
  rightLabel?: string;
}

const OPTIONS: ProfileOption[] = [
  { key: 'edit', icon: icons.editProfile, title: 'Edit Profile' },
  { key: 'password', icon: icons.passwordKey, title: 'Change Password' },
  { key: 'wishlist', icon: icons.wishlist, title: 'My Wishlist' },
  { key: 'jobs', icon: icons.myJobApplications, title: 'My job applications' },
  { key: 'cards', icon: icons.cards, title: "My Card's" },
  { key: 'verified', icon: icons.verified, title: 'Get verified' },
  { key: 'refer', icon: icons.refer, title: 'Refer & earn £10', rightLabel: '#SPA1258' },
  { key: 'logout', icon: icons.logout, title: 'Log out', danger: true },
  { key: 'delete', icon: icons.deleteAccount, title: 'Delete Account', danger: true },
];

const ProfileScreen = ({ navigation }: MainTabScreenProps<'Profile'>) => {
  const handlePress = (key: string) => {
    if (key === 'edit') {
      navigation.navigate('EditProfileScreen');
    } else if (key === 'password') {
      navigation.navigate('ChangePasswordScreen');
    } else if (key === 'wishlist') {
      navigation.navigate('WishlistScreen');
    } else if (key === 'jobs') {
      navigation.navigate('MyJobApplicationsScreen');
    } else if (key === 'verified') {
      navigation.navigate('GetVerifiedScreen');
    } else if (key === 'logout') {
      Alert.alert('Log out', 'Are you sure you want to log out of your account?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () =>
            navigation.getParent()?.reset({ index: 0, routes: [{ name: 'LoginScreen' }] }),
        },
      ]);
    } else if (key === 'delete') {
      Alert.alert(
        'Delete Account',
        'This will permanently delete your account and all your data. This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => { } },
        ],
      );
    }
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Image
              source={icons.tabProfile}
              style={styles.avatarIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.profileTextCol}>
            <Text style={styles.name}>kenzi lawson</Text>
            <Text style={styles.email}>kenzi.lawson@example.com</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Renter</Text>
          </View>
        </View>

        {OPTIONS.map(option => (
          <TouchableOpacity
            key={option.key}
            activeOpacity={0.8}
            style={styles.optionRow}
            onPress={() => handlePress(option.key)}
          >
            <Image
              source={option.icon}
              style={[styles.optionIcon, option.danger && { tintColor: colors.red }]}
              resizeMode="contain"
            />
            <Text
              style={[styles.optionTitle, option.danger && { color: colors.red }]}
            >
              {option.title}
            </Text>
            {!!option.rightLabel && (
              <View style={styles.rightLabelRow}>
                <Image
                  source={icons.copyText}
                  style={styles.rightLabelIcon}
                  resizeMode="contain"
                />
                <Text style={styles.rightLabelText}>{option.rightLabel}</Text>
              </View>
            )}
            <Image source={icons.arrow} style={styles.chevron} resizeMode="contain" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  header: {
    alignItems: 'center',
    paddingVertical: hp(14),
  },
  headerTitle: {
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
  },
  scrollContent: {
    paddingHorizontal: wp(20),
    paddingTop: hp(16),
    paddingBottom: hp(20),
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(14),
    borderRadius: wp(12),
    backgroundColor: colors.mintBg,
    borderWidth: 1,
    borderColor: colors.primary80,
    marginBottom: hp(20),
  },
  avatar: {
    width: wp(64),
    height: wp(64),
    borderRadius: wp(32),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarIcon: {
    width: wp(32),
    height: wp(32),
    tintColor: colors.subText,
  },
  profileTextCol: {
    flex: 1,
    marginLeft: wp(12),
  },
  name: {
    color: colors.black,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato600,
    fontWeight: 600
  },
  email: {
    marginTop: hp(3),
    color: colors.primary,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  roleBadge: {
    paddingHorizontal: wp(16),
    paddingVertical: hp(8),
    borderRadius: wp(20),
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  roleBadgeText: {
    color: colors.black,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(56),
    paddingHorizontal: wp(16),
    borderRadius: wp(8),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black1,
    marginBottom: hp(12),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  optionIcon: {
    width: wp(24),
    height: wp(24),
    marginRight: wp(12),
  },
  optionTitle: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato500,
  },
  rightLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(8),
  },
  rightLabelIcon: {
    width: wp(14),
    height: wp(14),
    marginRight: wp(5),
  },
  rightLabelText: {
    color: colors.primary,
    fontSize: fontSize(12.5),
    fontFamily: fonts.Lato700,
  },
  chevron: {
    width: wp(14),
    height: wp(14),
    tintColor: colors.darkGray,
  },
});
