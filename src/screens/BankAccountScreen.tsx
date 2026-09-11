import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

import { icons } from '../../assets/icons';
import CustomButton from '../components/CustomButton';
import { CloseIcon } from '../components/icons/CardIcons';
import ToastAlert from '../components/ToastAlert';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { supabase } from '../api/supabaseClient';
import { BankAccountScreenProps } from '../interface/screenTypes';

interface ConnectStatus {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

// Must match the RETURN_URL hardcoded in the connect-bank-account Edge
// Function.
const BANK_ACCOUNT_RETURN_URL = 'https://vsxdiyxkpbowkleikjmp.supabase.co/functions/v1/bank-account-return';

const BankAccountScreen = ({ navigation }: BankAccountScreenProps) => {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [webviewUrl, setWebviewUrl] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('users')
      .select('stripe_connect_id, connect_charges_enabled, connect_payouts_enabled, connect_details_submitted')
      .eq('id', authData.user.id)
      .single();

    setStatus({
      connected: !!data?.stripe_connect_id,
      chargesEnabled: !!data?.connect_charges_enabled,
      payoutsEnabled: !!data?.connect_payouts_enabled,
      detailsSubmitted: !!data?.connect_details_submitted,
    });
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      refreshStatus();
    }, [refreshStatus]),
  );

  const handleConnect = async () => {
    setConnecting(true);
    const { data, error } = await supabase.functions.invoke('connect-bank-account');
    setConnecting(false);

    if (error || !data?.url) {
      let description = 'Please try again.';
      if (error instanceof FunctionsHttpError) {
        try {
          const body = await error.context.json();
          description = body?.error ?? description;
        } catch {
          // response body wasn't JSON — fall back to the generic message
        }
      }
      ToastAlert({ title: 'Could not open Stripe', description });
      return;
    }

    setWebviewUrl(data.url);
  };

  const handleOnboardingComplete = () => {
    setWebviewUrl(null);
    setLoading(true);
    refreshStatus();
  };

  // Primary completion signal: the WebView navigating to the return URL at
  // all is enough — this doesn't depend on that page's own JS/postMessage
  // ever running, so it can't be broken by how that page happens to render.
  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    if (navState.url.startsWith(BANK_ACCOUNT_RETURN_URL)) {
      handleOnboardingComplete();
    }
  };

  // Secondary signal, kept as a harmless backup: the return page also
  // tries to `window.ReactNativeWebView.postMessage(...)` once loaded,
  // the mobile equivalent of a web popup's `window.opener.callback()`.
  const handleWebviewMessage = (event: WebViewMessageEvent) => {
    if (event.nativeEvent.data === 'bank_connect_complete') {
      handleOnboardingComplete();
    }
  };

  const isFullyOnboarded = !!status?.payoutsEnabled;

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
          Bank Account
        </Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.statusCard}>
            <Image source={icons.bank} style={styles.bankIcon} />
            <Text style={styles.statusTitle}>
              {isFullyOnboarded
                ? 'Bank account connected'
                : status?.connected
                ? 'Finish connecting your bank account'
                : 'Get paid for your bookings'}
            </Text>
            <Text style={styles.statusDesc}>
              {isFullyOnboarded
                ? 'Payouts are enabled — booking earnings will be sent to this account.'
                : status?.connected
                ? 'You started onboarding with Stripe but it looks incomplete — finish it to start receiving payouts.'
                : 'Connect a payout bank account via Stripe to start receiving your booking earnings.'}
            </Text>
          </View>

          <CustomButton
            title={
              isFullyOnboarded
                ? 'Manage on Stripe'
                : status?.connected
                ? 'Finish Onboarding'
                : 'Connect Bank Account'
            }
            onPress={handleConnect}
            loader={connecting}
            disable={connecting}
            buttonStyle={styles.connectButton}
          />
        </ScrollView>
      )}

      <Modal visible={!!webviewUrl} animationType="slide" onRequestClose={() => setWebviewUrl(null)}>
        {/* RN's core Modal presents its content on a separate native
            surface, so the app-wide SafeAreaProvider's measured insets
            don't reliably reach a SafeAreaView nested inside it — giving
            this subtree its own provider fixes the header/close button
            rendering under the status bar/notch. */}
        <SafeAreaProvider>
          <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
            <View style={styles.webviewHeader}>
              <View style={styles.webviewCloseButton} />
              <Text numberOfLines={1} style={styles.headerTitle}>
                Connect Bank Account
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setWebviewUrl(null)}
                style={styles.webviewCloseButton}
              >
                <CloseIcon size={14} />
              </TouchableOpacity>
            </View>
            {webviewUrl && (
              <WebView
                source={{ uri: webviewUrl }}
                onMessage={handleWebviewMessage}
                onNavigationStateChange={handleNavigationStateChange}
              />
            )}
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </SafeAreaView>
  );
};

export default BankAccountScreen;

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
    bottom: -8,
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: wp(20),
    paddingTop: hp(20),
    paddingBottom: hp(40),
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: colors.sage,
    borderRadius: wp(18),
    borderWidth: 1,
    borderColor: colors.primary,
    padding: wp(24),
  },
  bankIcon: {
    width: wp(48),
    height: wp(48),
    resizeMode: 'contain',
    tintColor: colors.primary,
    marginBottom: hp(14),
  },
  statusTitle: {
    textAlign: 'center',
    color: colors.black,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato700,
  },
  statusDesc: {
    marginTop: hp(10),
    textAlign: 'center',
    color: colors.darkGray,
    fontSize: fontSize(13.5),
    lineHeight: fontSize(19),
    fontFamily: fonts.Lato500,
  },
  connectButton: {
    marginTop: hp(24),
  },
  webviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightWhite,
  },
  webviewCloseButton: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPlaceHolderColor,
  },
});
