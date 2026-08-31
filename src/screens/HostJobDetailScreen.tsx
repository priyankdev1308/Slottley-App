import React from 'react';
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

import CustomButton from '../components/CustomButton';
import ReadMoreText from '../components/ReadMoreText';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { HostJobDetailScreenProps } from '../interface/screenTypes';
import { HOST_JOBS } from './HostMyJobScreen';

const HostJobDetailScreen = ({ navigation, route }: HostJobDetailScreenProps) => {
  const job = HOST_JOBS.find(j => j.id === route.params?.jobId) ?? HOST_JOBS[0];

  const handleDelete = () => {
    Alert.alert('Delete Job', `Are you sure you want to delete "${job.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
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
            <Text style={styles.jobTitle}>{job.title}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{job.jobType}</Text>
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
            <View style={styles.metaItem}>
              <Image source={icons.calendar} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.metaText}>{job.startDate}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Image source={icons.money} style={styles.metaIcon} resizeMode="contain" />
            <Text style={styles.metaText}>{job.payAmount}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>About This Job</Text>
        <ReadMoreText
          text={job.description}
          numberOfLines={3}
          style={styles.bodyText}
          linkStyle={styles.readMore}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Benefits</Text>
        <Text style={styles.bodyText}>{job.benefits}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>What They're Looking For</Text>
        <Text style={styles.bodyText}>{job.lookingFor}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>How To Apply</Text>
        <Text style={styles.bodyText}>{job.howToApply}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Edit"
          onPress={() => navigation.navigate('AddNewJobScreen', { jobId: job.id })}
          buttonStyle={styles.editButton}
          textStyle={styles.editButtonText}
        />
        <CustomButton
          title="Delete"
          onPress={handleDelete}
          buttonStyle={styles.deleteButton}
          textStyle={styles.deleteButtonText}
        />
      </View>
    </SafeAreaView>
  );
};

export default HostJobDetailScreen;

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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(10),
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
    color: colors.black,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  sectionLabel: {
    marginTop: hp(24),
    marginBottom: hp(10),
    color: colors.primary,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  bodyText: {
    color: colors.subText,
    fontSize: fontSize(14),
    lineHeight: fontSize(20),
    fontFamily: fonts.Lato400,
  },
  readMore: {
    marginTop: hp(4),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1,
    marginTop: hp(20),
    backgroundColor: colors.EBEBEB,
  },
  footer: {
    flexDirection: 'row',
    gap: wp(12),
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(16),
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    color: colors.primary,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.lightRed,
    borderWidth: 1,
    borderColor: colors.red80,
  },
  deleteButtonText: {
    color: colors.red,
  },
});
