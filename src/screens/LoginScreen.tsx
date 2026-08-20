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
import { LoginScreenProps } from '../interface/screenTypes';
import { SpaceRole } from '../navigation/TabNav';

type AuthTab = 'login' | 'register';

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [role, setRole] = useState<SpaceRole>('find');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const isLogin = activeTab === 'login';

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
                    onPress={() => navigation.navigate('MainTabs', { userRole: role })}
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
                            { tintColor: role === 'find' ? colors.white : colors.darkGray },
                          ]}
                          resizeMode="contain"
                        />
                      }
                      title="Find Space"
                      selected={role === 'find'}
                      onPress={() => setRole('find')}
                    />
                    <RegisterOptionCard
                      icon={
                        <Image
                          source={icons.store}
                          style={[
                            styles.optionIcon,
                            { tintColor: role === 'list' ? colors.white : colors.darkGray },
                          ]}
                          resizeMode="contain"
                        />
                      }
                      title="List Space"
                      selected={role === 'list'}
                      onPress={() => setRole('list')}
                    />
                  </View>

                  <CustomTextInput
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChangeText={setFullName}
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

                  <CustomButton
                    title="Create Account"
                    onPress={() => navigation.navigate('MainTabs', { userRole: role })}
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
