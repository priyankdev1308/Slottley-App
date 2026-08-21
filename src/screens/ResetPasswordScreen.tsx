import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthHeader from '../components/AuthHeader';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import ToastAlert from '../components/ToastAlert';
import { colors } from '../utils/colors';
import { hp, wp, isIos } from '../helpers/responsive';
import { supabase } from '../api/supabaseClient';
import { ResetPasswordScreenProps } from '../interface/screenTypes';

const ResetPasswordScreen = ({ navigation }: ResetPasswordScreenProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetPassword = async () => {
    if (password.length < 6) {
      ToastAlert({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
      });
      return;
    }
    if (password !== confirmPassword) {
      ToastAlert({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      ToastAlert({ title: 'Could not update password', description: error.message });
      return;
    }

    ToastAlert({ title: 'Password updated', description: 'You can now sign in with your new password.' });
    navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
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
          <AuthHeader heading="Set New Password" />

          <View style={styles.card}>
            <CustomTextInput
              label="New Password"
              placeholder="Enter your new password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <CustomTextInput
              label="Confirm Password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <CustomButton
              title="Update Password"
              onPress={handleSetPassword}
              loader={loading}
              disable={loading}
              buttonStyle={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

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
});
