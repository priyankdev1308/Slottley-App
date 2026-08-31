import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { icons } from '../../assets/icons';
import ConfirmModal from '../components/ConfirmModal';
import ToastAlert from '../components/ToastAlert';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { supabase } from '../api/supabaseClient';
import { MainTabScreenProps, SpaceRole } from '../navigation/TabNav';

const ROLE_LABELS: Record<SpaceRole, string> = {
  renter: 'Renter',
  host: 'Host',
};

const capitalize = (part: string) =>
  part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();

const formatFullName = (firstName: string | null | undefined, surName: string | null | undefined) =>
  [firstName, surName]
    .filter(Boolean)
    .map(part => part!.trim())
    .filter(Boolean)
    .flatMap(part => part.split(/\s+/))
    .map(capitalize)
    .join(' ') || '—';

interface UserProfile {
  first_name: string | null;
  sur_name: string | null;
  email: string | null;
  role: SpaceRole | null;
  profile_image: string | null;
  login_type: string | null;
  referral_code: string | null;
}

const PROFILE_IMAGE_BUCKET = 'profile_images';

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
  { key: 'jobs', icon: icons.myJobApplications, title: 'My Job Applications' },
  { key: 'cards', icon: icons.cards, title: "My Cards" },
  { key: 'bank', icon: icons.bank, title: "Bank Account" },
  { key: 'verified', icon: icons.verified, title: 'Get Verified' },
  { key: 'refer', icon: icons.refer, title: 'Refer & Earn £10' },
  { key: 'subscription', icon: icons.subscription, title: 'Subscription' },
  { key: 'logout', icon: icons.signoutRed, title: 'Log out', danger: true },
  { key: 'delete', icon: icons.deleteAccount, title: 'Delete Account', danger: true },
];

const ProfileScreen = ({ navigation }: MainTabScreenProps<'Profile'>) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setProfileLoading(true);

      (async () => {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          if (!cancelled) setProfileLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('first_name, sur_name, email, role, profile_image, login_type, referral_code')
          .eq('id', authData.user.id)
          .single();

        if (!cancelled) {
          if (!error && data) {
            setProfile(data);
          }
          setProfileLoading(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handlePress = (key: string) => {
    if (key === 'edit') {
      navigation.navigate('EditProfileScreen');
    } else if (key === 'password') {
      navigation.navigate('ChangePasswordScreen');
    } else if (key === 'wishlist') {
      navigation.navigate('WishlistScreen');
    } else if (key === 'jobs') {
      navigation.navigate('MyJobApplicationsScreen');
    } else if (key === 'cards') {
      navigation.navigate('MyCardsScreen');
    } else if (key === 'verified') {
      navigation.navigate('GetVerifiedScreen');
    } else if (key === 'refer') {
      navigation.navigate('ReferEarnScreen');
    } else if (key === 'logout') {
      setLogoutModalVisible(true);
    } else if (key === 'delete') {
      setDeleteModalVisible(true);
    } else if (key === 'subscription') {
      navigation.navigate('SubscriptionScreen');
    }
  };

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await supabase.auth.signOut();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    const { error } = await supabase.functions.invoke('delete-account');
    setDeleteLoading(false);
    setDeleteModalVisible(false);

    if (error) {
      ToastAlert({ title: 'Could not delete account', description: error.message });
      return;
    }

    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerShadowStrip} />
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
              source={
                profile?.profile_image
                  ? {
                    uri: supabase.storage
                      .from(PROFILE_IMAGE_BUCKET)
                      .getPublicUrl(profile.profile_image).data.publicUrl,
                  }
                  : icons.tabProfile
              }
              style={profile?.profile_image ? styles.avatarPhoto : styles.avatarIcon}
              resizeMode={profile?.profile_image ? 'cover' : 'contain'}
            />
          </View>
          {profileLoading ? (
            <View style={styles.profileTextCol}>
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading details...</Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.profileTextCol}>
                <Text style={styles.name}>{formatFullName(profile?.first_name, profile?.sur_name)}</Text>
                <Text style={styles.email}>{profile?.email || '—'}</Text>
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {profile?.role ? ROLE_LABELS[profile.role] : '—'}
                </Text>
              </View>
            </>
          )}
        </View>

        {OPTIONS.filter(option => {
          if (option.key === 'subscription') return profile?.role === 'host';
          if (option.key === 'bank') return profile?.role === 'host';
          if (option.key === 'wishlist') return profile?.role === 'renter';
          if (option.key === 'password') return !profile?.login_type || profile.login_type === 'email';
          return true;
        }).map(option => {
          const rightLabel =
            option.key === 'refer' ? profile?.referral_code ?? undefined : option.rightLabel;

          return (
            <TouchableOpacity
              key={option.key}
              activeOpacity={0.8}
              style={styles.optionRow}
              onPress={() => handlePress(option.key)}
            >
              <Image
                source={option.icon}
                style={[
                  styles.optionIcon,
                  option.danger && option.key !== 'logout' && { tintColor: colors.red },
                ]}
                resizeMode="contain"
              />
              <Text
                style={[styles.optionTitle, option.danger && { color: colors.red }]}
              >
                {option.title}
              </Text>
              {!!rightLabel && (
                <View style={styles.rightLabelRow}>
                  <Image
                    source={icons.copyText}
                    style={styles.rightLabelIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.rightLabelText}>{rightLabel}</Text>
                </View>
              )}
              <Image source={icons.arrow} style={styles.chevron} resizeMode="contain" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ConfirmModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={handleLogout}
        icon={<Image source={icons.logout} style={styles.confirmIcon} resizeMode="contain" />}
        iconBg="transparent"
        title="Are You Sure ?"
        description="You will be logged out from your account. You can log in again anytime."
        cancelText="No"
        confirmText="Yes, Log Out"
      />

      <ConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteAccount}
        icon={<Image source={icons.deleteCircle} style={styles.confirmIcon} resizeMode="contain" />}
        iconBg="transparent"
        title="Are You Sure ?"
        description="This action cannot be undone. Your account will be permanently deleted."
        cancelText="Cancel"
        confirmText="Yes, Delete"
        confirmLoading={deleteLoading}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  confirmIcon: {
    width: wp(80),
    height: wp(80),
  },
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  header: {
    alignItems: 'center',
    paddingVertical: hp(14),
    backgroundColor: colors.screenBgColor,
    height: hp(64),
    position: 'relative',
  },
  headerShadowStrip: {
    position: 'absolute',
    bottom: -8,          // sits just below the header
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: colors.screenBgColor,
    ...headerShadow,
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
    tintColor: colors.primary,
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: wp(32),
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  loadingText: {
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
