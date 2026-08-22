import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { GetVerifiedScreenProps } from '../interface/screenTypes';

interface UploadItem {
  key: 'photoId' | 'liabilityInsurance';
  title: string;
  description?: string;
}

const UPLOAD_ITEMS: UploadItem[] = [
  { key: 'photoId', title: 'Photo ID (Passport or Driving licence)' },
  {
    key: 'liabilityInsurance',
    title: 'Liability Insurance Certificate',
    description:
      "Upload proof of current liability insurance (public liability and/or professional indemnity). You're responsible for ensuring your cover is appropriate for the services you offer.",
  },
];

const GetVerifiedScreen = ({ navigation }: GetVerifiedScreenProps) => {
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});

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
        <Text style={styles.headerTitle}>Get verified</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {UPLOAD_ITEMS.map(item => (
          <View key={item.key}>
            <Text style={styles.sectionLabel}>{item.title}</Text>
            {!!item.description && (
              <Text style={styles.sectionDescription}>{item.description}</Text>
            )}

            <View style={styles.uploadBox}>
              <View style={styles.plusCircle}>
                <Text style={styles.plusText}>+</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.addButton}
                onPress={() => setUploaded(prev => ({ ...prev, [item.key]: true }))}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              {uploaded[item.key] && (
                <Text style={styles.uploadedText}>Document added</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton title="Verify" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
};

export default GetVerifiedScreen;

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
    marginBottom: hp(8),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  sectionDescription: {
    marginBottom: hp(12),
    color: colors.subText,
    fontSize: fontSize(12),
    fontStyle: 'italic',
    lineHeight: fontSize(17),
    fontFamily: fonts.Lato400,
  },
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(50),
    borderRadius: wp(16),
    backgroundColor: colors.primary10,
    borderWidth: 1,
    borderColor: colors.primary20,
  },
  plusCircle: {
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(16),
  },
  plusText: {
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
    fontSize: fontSize(12),
    fontFamily: fonts.Lato700,
  },
  uploadedText: {
    marginTop: hp(14),
    color: colors.darkGray,
    fontSize: fontSize(12.5),
    fontFamily: fonts.Lato400,
  },
  footer: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(16),
  },
});
