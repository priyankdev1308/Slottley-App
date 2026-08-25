import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthHeader from '../components/AuthHeader';
import AuthTabs from '../components/AuthTabs';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import SocialButton from '../components/SocialButton';
import OrDivider from '../components/OrDivider';
import RegisterOptionCard from '../components/RegisterOptionCard';
import { GoogleIcon, AppleIcon } from '../components/icons/AuthIcons';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp, isIos } from '../helpers/responsive';
import { isValidEmail } from '../helpers/globalFunctions';
import { supabase } from '../api/supabaseClient';
import ToastAlert from '../components/ToastAlert';
import { LoginScreenProps } from '../interface/screenTypes';
import { SpaceRole } from '../navigation/TabNav';

type AuthTab = 'login' | 'register';

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [role, setRole] = useState<SpaceRole>('renter');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [surName, setSurName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);

  const isLogin = activeTab === 'login';

  const handleSignIn = async () => {
    if (!isValidEmail(email)) {
      ToastAlert({ title: 'Invalid email', description: 'Please enter a valid email address.' });
      return;
    }
    if (!password) {
      ToastAlert({ title: 'Password required', description: 'Please enter your password.' });
      return;
    }

    setSignInLoading(true);
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setSignInLoading(false);
      ToastAlert({ title: 'Sign in failed', description: error.message });
      return;
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single();
    setSignInLoading(false);

    const signedInRole: SpaceRole = (profile?.role as SpaceRole) ?? 'renter';
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { userRole: signedInRole } }],
    });
  };

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      ToastAlert({ title: 'Full name required', description: 'Please enter your full name.' });
      return;
    }
    if (!isValidEmail(registerEmail)) {
      ToastAlert({ title: 'Invalid email', description: 'Please enter a valid email address.' });
      return;
    }
    if (registerPassword.length < 6) {
      ToastAlert({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
      });
      return;
    }
    if (confirmPassword !== registerPassword) {
      ToastAlert({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
      });
      return;
    }

    setSignUpLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: registerEmail.trim(),
      password: registerPassword,
      options: {
        data: {
          full_name: fullName.trim(),
          referral_code: referralCode.trim() || null,
          role,
        },
      },
    });
    setSignUpLoading(false);

    if (error) {
      ToastAlert({ title: 'Registration failed', description: error.message });
      return;
    }

    if (!data.session) {
      ToastAlert({
        title: 'Confirm your email',
        description: 'We sent you a confirmation link. Please verify your email, then sign in.',
      });
      setActiveTab('login');
      return;
    }

    navigation.reset({ index: 0, routes: [{ name: 'MainTabs', params: { userRole: role } }] });
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
          <AuthHeader
            heading={isLogin ? 'Sign in to your Account' : 'Create New Account'}
          />

          <View style={styles.card}>
            <AuthTabs
              active={activeTab}
              onLogin={() => setActiveTab('login')}
              onRegister={() => setActiveTab('register')}
            />

            <View style={styles.form}>
              {isLogin ? (
                <>
                  <CustomTextInput
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                  <CustomTextInput
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />

                  <TouchableOpacity
                    style={styles.forgotWrap}
                    onPress={() => navigation.navigate('ForgotPasswordScreen')}
                  >
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <CustomButton
                    title="Sign In"
                    onPress={handleSignIn}
                    loader={signInLoading}
                    disable={signInLoading}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.sectionLabel}>I Want to</Text>

                  <View style={styles.roleRow}>
                    <RegisterOptionCard
                      icon={
                        <Image
                          source={icons.findSpace}
                          style={[
                            styles.optionIcon,
                            { tintColor: role === 'renter' ? colors.white : colors.darkGray },
                          ]}
                          resizeMode="contain"
                        />
                      }
                      title="Find Space"
                      selected={role === 'renter'}
                      onPress={() => setRole('renter')}
                    />
                    <RegisterOptionCard
                      icon={
                        <Image
                          source={icons.store}
                          style={[
                            styles.optionIcon,
                            { tintColor: role === 'host' ? colors.white : colors.darkGray },
                          ]}
                          resizeMode="contain"
                        />
                      }
                      title="List Space"
                      selected={role === 'host'}
                      onPress={() => setRole('host')}
                    />
                  </View>

                  <CustomTextInput
                    label="First Name"
                    placeholder="Enter your first name"
                    value={fullName}
                    onChangeText={setFullName}
                    maxLength={25}
                    containerStyle={styles.fieldSpacing}
                  />
                  <CustomTextInput
                    label="Surname"
                    placeholder="Enter surname"
                    value={surName}
                    onChangeText={setSurName}
                    maxLength={25}
                    containerStyle={styles.fieldSpacing}
                  />
                  <CustomTextInput
                    label="Referral Code"
                    placeholder="Enter referral code"
                    value={referralCode}
                    onChangeText={setReferralCode}
                    autoCapitalize="characters"
                  />
                  <CustomTextInput
                    label="Email"
                    placeholder="Enter your email"
                    value={registerEmail}
                    onChangeText={setRegisterEmail}
                    keyboardType="email-address"
                  />
                  <CustomTextInput
                    label="Password"
                    placeholder="Create a password"
                    value={registerPassword}
                    onChangeText={setRegisterPassword}
                    secureTextEntry
                  />
                  <CustomTextInput
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />

                  <CustomButton
                    title="Create Account"
                    onPress={handleSignUp}
                    loader={signUpLoading}
                    disable={signUpLoading}
                  />
                </>
              )}

              <OrDivider />

              <View style={styles.socialRow}>
                <SocialButton label="Google" icon={<GoogleIcon />} onPress={() => { }} />
                <SocialButton label="Apple" icon={<AppleIcon />} onPress={() => { }} />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

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
    paddingTop: hp(20),
  },
  form: {
    marginTop: hp(24),
  },
  fieldSpacing: {
    marginTop: hp(4),
  },
  sectionLabel: {
    marginBottom: hp(10),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  forgotWrap: {
    alignItems: 'flex-end',
    marginBottom: hp(20),
  },
  forgotText: {
    color: colors.primary,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
    textDecorationLine: 'underline',
  },
  socialRow: {
    flexDirection: 'row',
    gap: wp(12),
  },
  roleRow: {
    flexDirection: 'row',
    gap: wp(12),
    marginBottom: hp(20),
  },
  optionIcon: {
    width: wp(30),
    height: wp(30),
  },
});
