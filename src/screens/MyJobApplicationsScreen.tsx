import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { MyJobApplicationsScreenProps } from '../interface/screenTypes';

type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Declined';

interface JobApplication {
  id: string;
  title: string;
  company: string;
  location: string;
  schedule: string;
  description: string;
  status: ApplicationStatus;
}

const STATUS_STYLES: Record<
  ApplicationStatus,
  { text: string; bg: string; border: string }
> = {
  Applied: { text: colors.primary, bg: colors.primary10, border: colors.primary50 },
  Shortlisted: { text: colors.complete, bg: colors.completeBg, border: colors.completeBorder },
  Declined: { text: colors.red, bg: colors.lightRed, border: colors.red80 },
};

const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'a1',
    title: 'Hair Apprentice',
    company: 'The Cutting Room',
    location: 'London — Shoreditch',
    schedule: 'Full Time',
    description:
      'A luxurious private beauty room perfect for hairstylists, beauticians, and wellness professionals.',
    status: 'Applied',
  },
  {
    id: 'a2',
    title: 'Hair Apprentice',
    company: 'The Cutting Room',
    location: 'London — Bayswater',
    schedule: 'Full Time',
    description:
      'A luxurious private beauty room perfect for hairstylists, beauticians, and wellness professionals.',
    status: 'Shortlisted',
  },
  {
    id: 'a3',
    title: 'Hair Apprentice',
    company: 'The Cutting Room',
    location: 'Manchester — Didsbury',
    schedule: 'Full Time',
    description:
      'A luxurious private beauty room perfect for hairstylists, beauticians, and wellness professionals.',
    status: 'Declined',
  },
];

const MyJobApplicationsScreen = ({ navigation }: MyJobApplicationsScreenProps) => {
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);

  const withdrawApplication = (id: string) => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: () => setApplications(prev => prev.filter(a => a.id !== id)),
        },
      ],
    );
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
        <Text style={styles.headerTitle}>My Job Applications</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {applications.map(application => {
          const statusStyle = STATUS_STYLES[application.status];
          return (
            <View key={application.id} style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.jobTitle}>{application.title}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {application.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.company}>{application.company}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Image source={icons.mapPin} style={styles.metaIcon} resizeMode="contain" />
                  <Text style={styles.metaText}>{application.location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Image source={icons.clock} style={styles.metaIcon} resizeMode="contain" />
                  <Text style={styles.metaText}>{application.schedule}</Text>
                </View>
              </View>

              <Text style={styles.description}>{application.description}</Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.withdrawButton}
                onPress={() => withdrawApplication(application.id)}
              >
                <Text style={styles.withdrawButtonText}>Withdraw Application</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyJobApplicationsScreen;

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
    paddingTop: hp(20),
    paddingBottom: hp(20),
  },
  card: {
    padding: wp(16),
    borderRadius: wp(8),
    backgroundColor: colors.white,
    marginBottom: hp(20),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  jobTitle: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
    marginRight: wp(10),
  },
  statusBadge: {
    paddingHorizontal: wp(14),
    paddingVertical: hp(7),
    borderRadius: wp(20),
    borderWidth: 1,
  },
  statusText: {
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
    alignItems: 'center',
    marginTop: hp(10),
    gap: wp(16),
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
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  description: {
    marginTop: hp(12),
    marginBottom: hp(16),
    color: colors.darkGray,
    fontSize: fontSize(12),
    lineHeight: fontSize(19),
    fontFamily: fonts.Lato500,
  },
  withdrawButton: {
    height: hp(52),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(26),
    backgroundColor: colors.lightGrayF5F5F5,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  withdrawButtonText: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
});
