import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';

import { icons } from '../../assets/icons';
import ShareIcon from '../components/icons/ShareIcon';
import ToastAlert from '../components/ToastAlert';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { supabase } from '../api/supabaseClient';
import { ReferEarnScreenProps } from '../interface/screenTypes';

const HOW_IT_WORKS = [
  'Share your code with stylists, beauticians or salon owners.',
  'When they sign up with it, you get £10 credit.',
  'Credit comes off your next booking automatically.',
];

const ReferEarnScreen = ({ navigation }: ReferEarnScreenProps) => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('referral_code, wallet_balance')
        .eq('id', authData.user.id)
        .single();

      setReferralCode(data?.referral_code ?? null);
      setCreditBalance(data?.wallet_balance ?? 0);
      setLoading(false);
    })();
  }, []);

  const handleCopy = () => {
    if (!referralCode) return;
    Clipboard.setString(referralCode);
    ToastAlert({ title: 'Copied', description: 'Referral code copied to clipboard.' });
  };

  const handleShare = () => {
    if (!referralCode) return;
    Share.share({
      message: `Hey! I've been using Slottley to rent beauty and wellness space flexibly — worth a look if you're a stylist, therapist, nail tech or salon/studio owner. Use my code ${referralCode} when you sign up and you'll get £10 credit (I do too)!`,
    });
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerShadowStrip} />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>
          Refer &amp; Earn
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Credit Balance</Text>
          <Text style={styles.balanceValue}>£{creditBalance}</Text>
          <Text style={styles.balanceDesc}>
            Applied automatically to your next booking.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Your referral code</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleCopy}
          disabled={!referralCode}
          style={styles.codeBox}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Image source={icons.copyText} style={styles.copyIcon} />
              <Text style={styles.codeText}>{referralCode ?? '—'}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleShare}
          disabled={!referralCode}
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
    backgroundColor: colors.screenBgColor,
    height: hp(64),
    position: 'relative',
  },
  headerShadowStrip: {
    position: 'absolute',
    bottom: -8,          // sits just below the header
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.screenBgColor,
    ...headerShadow,
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
    paddingTop: hp(20),
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
