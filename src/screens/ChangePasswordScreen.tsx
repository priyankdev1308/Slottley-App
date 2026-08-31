import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import { EyeIcon, EyeOffIcon } from '../components/icons/CardIcons';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { ChangePasswordScreenProps } from '../interface/screenTypes';

const ChangePasswordScreen = ({ navigation }: ChangePasswordScreenProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords Do Not Match', 'New Password and Confirm Password must match.');
      return;
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerShadowStrip} />
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={icons.back} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Current Password</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            placeholderTextColor={colors.placeHolder}
            secureTextEntry={!showCurrentPassword}
            style={styles.inputField}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowCurrentPassword(v => !v)}
          >
            {showCurrentPassword ? <EyeIcon /> : <EyeOffIcon />}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>New Password</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor={colors.placeHolder}
            secureTextEntry={!showNewPassword}
            style={styles.inputField}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowNewPassword(v => !v)}
          >
            {showNewPassword ? <EyeIcon /> : <EyeOffIcon />}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Confirm Password</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter new password"
            placeholderTextColor={colors.placeHolder}
            secureTextEntry={!showConfirmPassword}
            style={styles.inputField}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowConfirmPassword(v => !v)}
          >
            {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton title="Change Password" onPress={handleChangePassword} />
      </View>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(20),
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
  backButton: {
    width: wp(32),
    height: wp(32),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backIcon: {
    width: wp(32),
    height: wp(32),
    tintColor: colors.primary,
  },
  headerTitle: {
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
  },
  scrollContent: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(20),
  },
  sectionLabel: {
    marginTop: hp(20),
    marginBottom: hp(10),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(54),
    paddingHorizontal: wp(16),
    borderRadius: wp(14),
    backgroundColor: '#364C7108',
    borderWidth: 1,
    borderColor: '#364C710F',
  },
  inputField: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  footer: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(16),
  },
});
