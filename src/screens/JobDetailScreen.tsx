import React from 'react';
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
import ReadMoreText from '../components/ReadMoreText';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { JobDetailScreenProps } from '../interface/screenTypes';

// Mock — will come from the job listing API keyed by route.params.jobId.
const JOB = {
  title: 'Hair Apprentice',
  company: 'The Cutting Room',
  location: 'London — Bayswater',
  schedule: 'Full Time',
  date: '15/12/2026',
  type: 'Apprenticeship',
  about:
    "Join our salon as a Hair Apprentice and gain hands-on experience while working alongside experienced stylists. You'll support daily salon operations and develop professional hairdressing skills through structured, on-the-job training under senior stylists' supervision.",
  benefits: [
    'Hands-on salon experience',
    'Professional training',
    'Flexible working hours',
    'Product discounts',
  ],
  lookingFor: [
    'Passion for hairdressing',
    'Willingness to learn',
    'Reliable and punctual',
    'Good communication skills',
    'Previous salon experience is a plus',
  ],
  howToApply: 'Apply via app',
};

const BulletList = ({ items }: { items: string[] }) => (
  <View>
    {items.map(item => (
      <View key={item} style={styles.bulletRow}>
        <Text style={styles.bulletDot}>{'•'}</Text>
        <Text style={styles.bulletText}>{item}</Text>
      </View>
    ))}
  </View>
);

const JobDetailScreen = ({ navigation }: JobDetailScreenProps) => {
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
        <Text style={styles.headerTitle}>Job Detail</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.jobTitle}>{JOB.title}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{JOB.type}</Text>
            </View>
          </View>
          <Text style={styles.company}>{JOB.company}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Image source={icons.mapPin} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.metaText}>{JOB.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Image source={icons.clock} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.metaText}>{JOB.schedule}</Text>
            </View>
            <View style={styles.metaItem}>
              <Image source={icons.calendar} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.metaText}>{JOB.date}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>About This Job</Text>
        <ReadMoreText
          text={JOB.about}
          numberOfLines={3}
          style={styles.aboutText}
          linkStyle={styles.readMore}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Benefits</Text>
        <BulletList items={JOB.benefits} />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>What They're Looking For</Text>
        <BulletList items={JOB.lookingFor} />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>How To Apply</Text>
        <Text style={styles.howToApplyText}>{JOB.howToApply}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Apply Now"
          onPress={() => navigation.navigate('JobApplyScreen')}
        />
      </View>
    </SafeAreaView>
  );
};

export default JobDetailScreen;

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
  card: {
    padding: wp(16),
    borderRadius: wp(8),
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  jobTitle: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato700,
    marginRight: wp(10),
  },
  typeBadge: {
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
    borderRadius: wp(14),
    backgroundColor: colors.lightGrayF5F5F5,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  typeBadgeText: {
    color: colors.darkGray,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  company: {
    marginTop: hp(4),
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: hp(12),
    rowGap: hp(8),
    columnGap: wp(16),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    width: wp(14),
    height: wp(14),
    marginRight: wp(5),
  },
  metaText: {
    color: colors.black,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400,
  },
  sectionLabel: {
    marginTop: hp(24),
    marginBottom: hp(12),
    color: colors.primary,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  aboutText: {
    color: colors.subText,
    fontSize: fontSize(14),
    lineHeight: fontSize(20),
    fontFamily: fonts.Lato600,
  },
  readMore: {
    marginTop: hp(4),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato600,
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1,
    marginTop: hp(20),
    backgroundColor: colors.EBEBEB,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: hp(8),
  },
  bulletDot: {
    width: wp(16),
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  bulletText: {
    flex: 1,
    color: colors.subText,
    fontSize: fontSize(13.5),
    fontFamily: fonts.Lato400,
  },
  howToApplyText: {
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  footer: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(16),
  },
});
