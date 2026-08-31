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
import { MainTabScreenProps } from '../navigation/TabNav';

export interface HostJob {
  id: string;
  title: string;
  company: string;
  location: string;
  schedule: string;
  jobType: 'Apprenticeship' | 'Employed';
  paid: boolean;
  payAmount: string;
  startDate: string;
  description: string;
  benefits: string;
  lookingFor: string;
  howToApply: string;
}

// TODO: replace with the signed-in host's real job postings once this
// screen is wired to a backend.
export const HOST_JOBS: HostJob[] = [
  {
    id: 'hj1',
    title: 'Hair Apprentice',
    company: 'The Cutting Room',
    location: 'London — Shoreditch',
    schedule: 'Full Time',
    jobType: 'Apprenticeship',
    paid: true,
    payAmount: '£120',
    startDate: '15/12/2026',
    description:
      'A luxurious private beauty room perfect for hairstylists, beauticians, and wellness professionals.',
    benefits: 'Product Discounts,Flexible Hours',
    lookingFor: 'Reliable, friendly, keen to learn. Level 2 a bonus.',
    howToApply: 'Apply via app',
  },
  {
    id: 'hj2',
    title: 'Ui Test Employe',
    company: 'Ui Tech Solution',
    location: 'London — Bayswater',
    schedule: 'Full Time',
    jobType: 'Employed',
    paid: true,
    payAmount: '£85',
    startDate: '17/12/2026',
    description:
      'A luxurious private beauty room perfect for hairstylists, beauticians, and wellness professionals.',
    benefits: 'Product Discounts,Flexible Hours',
    lookingFor: 'Friendly, Reliable',
    howToApply: 'Apply via app',
  },
  {
    id: 'hj3',
    title: 'Hair Apprentice',
    company: 'The Cutting Room',
    location: 'London — Shoreditch',
    schedule: 'Full Time',
    jobType: 'Apprenticeship',
    paid: true,
    payAmount: '£120',
    startDate: '25/12/2026',
    description:
      'A luxurious private beauty room perfect for hairstylists, beauticians, and wellness professionals.',
    benefits: 'Product Discounts,Flexible Hours',
    lookingFor: 'Reliable, friendly, keen to learn. Level 2 a bonus.',
    howToApply: 'Apply via app',
  },
];

const HostMyJobScreen = ({ navigation }: MainTabScreenProps<'Job'>) => {
  const [jobs, setJobs] = useState(HOST_JOBS);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleEdit = (job: HostJob) => {
    setOpenMenuId(null);
    navigation.navigate('AddNewJobScreen', { jobId: job.id });
  };

  const handleDelete = (job: HostJob) => {
    setOpenMenuId(null);
    Alert.alert('Delete Job', `Are you sure you want to delete "${job.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setJobs(prev => prev.filter(j => j.id !== job.id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerShadowStrip} />
        <View style={styles.backButton} />
        <Text style={styles.headerTitle}>My Job</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backButton}
          onPress={() => navigation.navigate('HostJobRequestScreen')}
        >
          <Image source={icons.addfriend} style={styles.requestsIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {jobs.map(job => (
          <TouchableOpacity
            key={job.id}
            activeOpacity={0.9}
            style={styles.card}
            onPress={() => navigation.navigate('HostJobDetailScreen', { jobId: job.id })}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => setOpenMenuId(prev => (prev === job.id ? null : job.id))}
              >
                <View style={styles.menuDots}>
                  <View style={styles.menuDot} />
                  <View style={styles.menuDot} />
                  <View style={styles.menuDot} />
                </View>
              </TouchableOpacity>

              {openMenuId === job.id && (
                <View style={styles.menuCard}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.menuItem}
                    onPress={() => handleEdit(job)}
                  >
                    <Text style={styles.menuItemText}>Edit Job</Text>
                  </TouchableOpacity>
                  <View style={styles.menuDivider} />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.menuItem}
                    onPress={() => handleDelete(job)}
                  >
                    <Text style={[styles.menuItemText, styles.menuItemDanger]}>Delete Job</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Text style={styles.company}>{job.company}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Image source={icons.mapPin} style={styles.metaIcon} resizeMode="contain" />
                <Text style={styles.metaText}>{job.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Image source={icons.clock} style={styles.metaIcon} resizeMode="contain" />
                <Text style={styles.metaText}>{job.schedule}</Text>
              </View>
            </View>

            <Text numberOfLines={2} style={styles.description}>
              {job.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.fab}
        onPress={() => navigation.navigate('AddNewJobScreen')}
      >
        <Image source={icons.addRound} style={styles.fabIcon} resizeMode="contain" />
        <Text style={styles.fabLabel}>Add Job</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HostMyJobScreen;

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
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestsIcon: {
    width: wp(28),
    height: wp(28),
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
    paddingBottom: hp(100),
  },
  card: {
    padding: wp(16),
    borderRadius: wp(16),
    backgroundColor: colors.white,
    marginBottom: hp(16),
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
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
    marginRight: wp(10),
  },
  menuDots: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(28),
    height: wp(28),
  },
  menuDot: {
    width: wp(4),
    height: wp(4),
    borderRadius: wp(2),
    backgroundColor: colors.primary,
    marginVertical: wp(1.5),
  },
  menuCard: {
    position: 'absolute',
    top: hp(30),
    right: 0,
    minWidth: wp(150),
    borderRadius: wp(14),
    backgroundColor: colors.white,
    paddingVertical: hp(4),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 20,
  },
  menuItem: {
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
  },
  menuItemText: {
    color: colors.black,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato600,
  },
  menuItemDanger: {
    color: colors.black,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.EBEBEB,
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
    marginTop: hp(12),
    gap: wp(20),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    width: wp(14),
    height: wp(14),
    marginRight: wp(6),
    tintColor: colors.primary,
  },
  metaText: {
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  description: {
    marginTop: hp(14),
    color: colors.subText,
    fontSize: fontSize(12),
    lineHeight: fontSize(19),
    fontFamily: fonts.Lato500,
  },
  fab: {
    position: 'absolute',
    right: wp(20),
    bottom: hp(24),
    width: wp(125),
    height: hp(55),
    borderRadius: hp(28),
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(8),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    width: wp(22),
    height: wp(22),
  },
  fabLabel: {
    color: colors.white,
    fontSize: fontSize(15),
    fontFamily: fonts.Lato700,
  },
});
