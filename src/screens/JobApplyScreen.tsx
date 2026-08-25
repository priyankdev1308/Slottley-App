import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp, isIos } from '../helpers/responsive';
import { JobApplyScreenProps } from '../interface/screenTypes';

const JobApplyScreen = ({ navigation }: JobApplyScreenProps) => {
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [cvName, setCvName] = useState<string | null>(null);
  const [experience, setExperience] = useState('02 year');
  const [phone, setPhone] = useState('1258789522');
  const [message, setMessage] = useState('');

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
        <Text style={styles.headerTitle}>Apply Job</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={isIos ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>Your CV</Text>
          <View style={styles.cvBox}>
            <View style={styles.cvPlusCircle}>
              <Text style={styles.cvPlusText}>+</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.addButton}
              onPress={() => setCvName('cv-document.pdf')}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            {!!cvName && <Text style={styles.cvFileName}>{cvName}</Text>}
          </View>

          <Text style={styles.sectionLabel}>Experience (optional)</Text>
          <TextInput
            value={experience}
            onChangeText={setExperience}
            placeholder="e.g. 2 years"
            placeholderTextColor={colors.placeHolder}
            style={styles.input}
          />

          <Text style={styles.sectionLabel}>Contact phone (optional)</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            placeholderTextColor={colors.placeHolder}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.sectionLabel}>Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Tell them a little about yourself"
            placeholderTextColor={colors.placeHolder}
            multiline
            textAlignVertical="top"
            style={styles.messageInput}
            onFocus={() =>
              setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 400)
            }
          />
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            title="Send Application"
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs', params: { initialTab: 'Job' } }],
              })
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default JobApplyScreen;

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
  cvBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(25),
    borderRadius: wp(12),
    backgroundColor: '#1535291A',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cvPlusCircle: {
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(16),
  },
  cvPlusText: {
    color: colors.primary,
    fontSize: fontSize(22),
    fontFamily: fonts.Lato400,
    marginTop: -2,
  },
  addButton: {
    paddingHorizontal: wp(28),
    paddingVertical: hp(10),
    borderRadius: wp(24),
    backgroundColor: colors.primary,
  },
  addButtonText: {
    color: colors.white,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  cvFileName: {
    marginTop: hp(14),
    color: colors.darkGray,
    fontSize: fontSize(12.5),
    fontFamily: fonts.Lato400,
  },
  input: {
    height: hp(54),
    paddingHorizontal: wp(16),
    borderRadius: wp(14),
    backgroundColor: '#364C7108',
    borderWidth: 1,
    borderColor: '#364C710F',
    color: colors.black,
    fontSize: fontSize(14.5),
    fontFamily: fonts.Lato400,
  },
  messageInput: {
    height: hp(120),
    paddingHorizontal: wp(16),
    paddingTop: hp(14),
    borderRadius: wp(12),
    backgroundColor: '#364C7108',
    color: colors.black,
    fontSize: fontSize(12),
    fontStyle: 'italic',
    fontFamily: fonts.Lato400,
    borderWidth: 1,
    borderColor: '#364C710F',
  },
  footer: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(16),
  },
});
