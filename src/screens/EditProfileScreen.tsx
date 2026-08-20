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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { EditProfileScreenProps } from '../interface/screenTypes';

const EditProfileScreen = ({ navigation }: EditProfileScreenProps) => {
  const [fullName, setFullName] = useState('kenzi lawson');
  const [email, setEmail] = useState('kenzi.lawson@example.com');
  const [location, setLocation] = useState('123 Beauty Street, Shoreditch London, E1 6AN, UK');

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={icons.back} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarCard}>
          <TouchableOpacity activeOpacity={0.85} style={styles.avatarWrap}>
            <Image
              source={icons.tabProfile}
              style={styles.avatarIcon}
              resizeMode="contain"
            />
            <View style={styles.cameraBadge}>
              <Image
                source={icons.camera}
                style={styles.cameraIcon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          placeholderTextColor={colors.placeHolder}
          style={styles.input}
        />

        <Text style={styles.sectionLabel}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor={colors.placeHolder}
          keyboardType="email-address"
          style={styles.input}
        />

        <Text style={styles.sectionLabel}>Location</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Enter your address"
          placeholderTextColor={colors.placeHolder}
          style={styles.input}
        />
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton title="Save Changes" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

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
  },
  backButton: {
    width: wp(32),
    height: wp(32),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backIcon: {
    width: wp(22),
    height: wp(22),
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
  avatarCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(30),
    borderRadius: wp(16),
    backgroundColor: colors.mintBg,
  },
  avatarWrap: {
    width: wp(120),
    height: wp(120),
  },
  avatarIcon: {
    width: '100%',
    height: '100%',
    borderRadius: wp(60),
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.lightGrayF5F5F5,
    tintColor: colors.subText,
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.mintBg,
  },
  cameraIcon: {
    width: wp(16),
    height: wp(16),
  },
  sectionLabel: {
    marginTop: hp(20),
    marginBottom: hp(10),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  input: {
    height: hp(54),
    paddingHorizontal: wp(16),
    borderRadius: wp(14),
    backgroundColor: '#364C7108',
    borderWidth: 1,
    borderColor: '#364C710F',
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
