import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthHeader from '../components/AuthHeader';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp, isIos } from '../helpers/responsive';
import { isValidEmail } from '../helpers/globalFunctions';
import { supabase, PASSWORD_RESET_REDIRECT_URL } from '../api/supabaseClient';
import ToastAlert from '../components/ToastAlert';
import { ForgotPasswordScreenProps } from '../interface/screenTypes';

const ForgotPasswordScreen = ({ navigation }: ForgotPasswordScreenProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetLink = async () => {
    if (!isValidEmail(email)) {
      ToastAlert({ title: 'Invalid email', description: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: PASSWORD_RESET_REDIRECT_URL,
    });
    setLoading(false);

    if (error) {
      ToastAlert({ title: 'Could not send reset link', description: error.message });
      return;
    }

    ToastAlert({
      title: 'Check your email',
      description: 'We sent you a link to reset your password.',
    });
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={isIos ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader heading="Reset Password" />

          <View style={styles.card}>
            <CustomTextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <CustomButton
              title="Send Reset Link"
              onPress={handleSendResetLink}
              loader={loading}
              disable={loading}
              buttonStyle={styles.button}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Remember Password? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    flex: 1,
    backgroundColor: colors.bgColor,
    borderTopLeftRadius: wp(28),
    borderTopRightRadius: wp(28),
    padding: wp(20),
    paddingTop: hp(28),
  },
  button: {
    marginTop: hp(12),
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(20),
  },
  footerText: {
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  footerLink: {
    color: colors.primary,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
    textDecorationLine: 'underline',
  },
});
