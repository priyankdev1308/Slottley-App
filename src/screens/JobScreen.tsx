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
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { MainTabScreenProps } from '../navigation/TabNav';

type JobType = 'Apprenticeship' | 'Employed';
type JobFilter = 'All' | JobType;

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  schedule: string;
  type: JobType;
  description: string;
}

const FILTERS: JobFilter[] = ['All', 'Apprenticeship', 'Employed'];

const JOBS: JobPosting[] = [
  {
    id: 'j1',
    title: 'Hair Apprentice',
    company: 'The Cutting Room',
    location: 'London — Shoreditch',
    schedule: 'Full Time',
    type: 'Apprenticeship',
    description:
      'A luxurious private beauty room perfect for hairstylists, beauticians, and wellness professionals.',
  },
  {
    id: 'j2',
    title: 'Hair Artist',
    company: 'Modern Salon',
    location: 'London — Bayswater',
    schedule: 'Full Time',
    type: 'Employed',
    description:
      'A luxurious private beauty room perfect for hairstylists, beauticians, and wellness professionals.',
  },
  {
    id: 'j3',
    title: 'Nail Tech',
    company: 'Nail Parlour',
    location: 'London — Bayswater',
    schedule: 'Full Time',
    type: 'Apprenticeship',
    description:
      'A luxurious private beauty room perfect for hairstylists, beauticians, and wellness professionals.',
  },
  {
    id: 'j4',
    title: 'Beauty Therapist',
    company: 'Glow Beauty Room',
    location: 'Manchester — Didsbury',
    schedule: 'Full Time',
    type: 'Employed',
    description:
      'A luxurious private beauty room perfect for hairstylists, beauticians, and wellness professionals.',
  },
];

const JobScreen = ({ navigation }: MainTabScreenProps<'Job'>) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<JobFilter>('All');

  const jobs = JOBS.filter(job => filter === 'All' || job.type === filter);

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerShadowStrip} />
        <Text style={styles.headerTitle}>Jobs</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchBar}>
          <Image
            source={icons.search_black}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Type to search..."
            placeholderTextColor={colors.placeHolder}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map(item => {
            const isSelected = filter === item;
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.85}
                onPress={() => setFilter(item)}
                style={[styles.filterPill, isSelected && styles.filterPillSelected]}
              >
                <Text
                  style={[styles.filterText, isSelected && styles.filterTextSelected]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {jobs.map(job => (
          <TouchableOpacity
            key={job.id}
            activeOpacity={0.9}
            style={styles.card}
            onPress={() => navigation.navigate('JobDetailScreen', { jobId: job.id })}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{job.type}</Text>
              </View>
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

            <Text style={styles.description}>{job.description}</Text>

            <CustomButton
              title="Apply"
              onPress={() => navigation.navigate('JobDetailScreen', { jobId: job.id })}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default JobScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  header: {
    alignItems: 'center',
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
  headerTitle: {
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
  },
  scrollContent: {
    paddingHorizontal: wp(20),
    paddingTop: hp(16),
    paddingBottom: hp(20),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(54),
    paddingHorizontal: wp(16),
    borderRadius: wp(16),
    backgroundColor: colors.white,
  },
  searchIcon: {
    width: wp(18),
    height: wp(18),
    marginRight: wp(10),
    tintColor: colors.subText,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: hp(16),
    gap: wp(10),
  },
  filterPill: {
    paddingHorizontal: wp(18),
    paddingVertical: hp(12),
    borderRadius: wp(8),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.EBEBEB,
  },
  filterPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.darkGray,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  filterTextSelected: {
    color: colors.white,
  },
  card: {
    marginTop: hp(20),
    padding: wp(16),
    borderRadius: wp(16),
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
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
    marginRight: wp(10),
  },
  typeBadge: {
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
    borderRadius: wp(14),
    backgroundColor: colors.lightGrayF5F5F5,
    borderWidth: 1,
    borderColor: colors.EBEBEB,
  },
  typeBadgeText: {
    color: colors.primary,
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
});
