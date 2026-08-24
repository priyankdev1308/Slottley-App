import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';

import { icons } from '../../assets/icons';
import ShareIcon from '../components/icons/ShareIcon';
import ToastAlert from '../components/ToastAlert';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { ReferEarnScreenProps } from '../interface/screenTypes';

// TODO: replace with the signed-in user's real referral code + credit
// balance (public.users) once this screen is wired to Supabase.
const REFERRAL_CODE = 'SPAC258F';
const CREDIT_BALANCE = 100;

const HOW_IT_WORKS = [
  'Share your code with stylists, beauticians or salon owners.',
  'When they sign up with it, you get £10 credit.',
  'Credit comes off your next booking automatically.',
];

const ReferEarnScreen = ({ navigation }: ReferEarnScreenProps) => {
  const handleCopy = () => {
    Clipboard.setString(REFERRAL_CODE);
    ToastAlert({ title: 'Copied', description: 'Referral code copied to clipboard.' });
  };

  const handleShare = () => {
    Share.share({
      message: `Use my Slottley referral code ${REFERRAL_CODE} and we both get credit!`,
    });
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>
          Refer &amp; earn
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Credit Balance</Text>
          <Text style={styles.balanceValue}>£{CREDIT_BALANCE}</Text>
          <Text style={styles.balanceDesc}>
            Applied automatically to your next booking.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Your referral code</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleCopy}
          style={styles.codeBox}
        >
          <Image source={icons.copyText} style={styles.copyIcon} />
          <Text style={styles.codeText}>{REFERRAL_CODE}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleShare}
          style={styles.shareButton}
        >
          <ShareIcon color={colors.primary} />
          <Text style={styles.shareButtonText}>Share Your Code</Text>
        </TouchableOpacity>

        <View style={styles.howItWorksCard}>
          <Text style={styles.howItWorksTitle}>How it Works</Text>
          {HOW_IT_WORKS.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{index + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReferEarnScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
  },
  backButton: {
    width: wp(38),
    height: wp(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: wp(32),
    height: wp(32),
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
  },
  content: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(40),
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: wp(18),
    padding: wp(24),
  },
  balanceLabel: {
    color: colors.white,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato600,
  },
  balanceValue: {
    marginTop: hp(8),
    color: colors.gold,
    fontSize: fontSize(34),
    fontFamily: fonts.Lato700,
  },
  balanceDesc: {
    marginTop: hp(8),
    color: colors.white,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato600,
  },
  sectionLabel: {
    marginTop: hp(28),
    marginBottom: hp(10),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato600,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(10),
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.gold,
    backgroundColor: colors.goldBg,
    borderRadius: wp(12),
    paddingVertical: hp(22),
  },
  copyIcon: {
    width: wp(20),
    height: wp(20),
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  codeText: {
    color: colors.primary,
    fontSize: fontSize(28),
    fontFamily: fonts.Lato500,
    letterSpacing: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(10),
    marginTop: hp(16),
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.sage,
    borderRadius: wp(30),
    paddingVertical: hp(15),
  },
  shareButtonText: {
    color: colors.primary,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  howItWorksCard: {
    marginTop: hp(24),
    backgroundColor: colors.sage,
    borderRadius: wp(12),
    padding: wp(18),
    borderWidth: 1,
    borderColor: colors.primary,
  },
  howItWorksTitle: {
    marginBottom: hp(12),
    color: colors.primary,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: hp(6),
  },
  stepNumber: {
    width: wp(20),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  stepText: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
    lineHeight: fontSize(15),
  },
});
