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

import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { HostJobRequestScreenProps } from '../interface/screenTypes';
import { HOST_JOBS } from './HostMyJobScreen';

type RequestStatus = 'pending' | 'shortlisted' | 'rejected';

interface JobRequest {
  id: string;
  jobId: string;
  applicantName: string;
  status: RequestStatus;
}

// TODO: replace with real applicants once this screen is wired to a backend.
const INITIAL_REQUESTS: JobRequest[] = [
  { id: 'r1', jobId: 'hj1', applicantName: 'kenzi lawson', status: 'pending' },
  { id: 'r2', jobId: 'hj2', applicantName: 'Willson', status: 'pending' },
  { id: 'r3', jobId: 'hj3', applicantName: 'kenzi lawson', status: 'pending' },
];

const HostJobRequestScreen = ({ navigation }: HostJobRequestScreenProps) => {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const updateStatus = (id: string, status: RequestStatus) => {
    setRequests(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
  };

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
        <Text style={styles.headerTitle}>Job Requests</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {requests.map(request => {
          const job = HOST_JOBS.find(j => j.id === request.jobId);
          if (!job) return null;

          return (
            <TouchableOpacity
              key={request.id}
              activeOpacity={0.9}
              style={styles.card}
              onPress={() => navigation.navigate('HostJobRequestDetails', { requestId: request.id })}
            >
              <Text style={styles.jobTitle}>{job.title}</Text>
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

              <View style={styles.divider} />

              <Text style={styles.sectionLabel}>Applicant</Text>
              <View style={styles.applicantRow}>
                <View style={styles.avatar}>
                  <Image
                    source={icons.tabProfile}
                    style={styles.avatarIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.applicantName}>{request.applicantName}</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => navigation.navigate('ChatDetailScreen', {
                    contactId: request.id,
                    name: request.applicantName,
                  })}
                >
                  <Image source={icons.chat} style={styles.chatIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>

              {request.status === 'pending' ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.rejectButton}
                    onPress={() => updateStatus(request.id, 'rejected')}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.shortlistButton}
                    onPress={() => updateStatus(request.id, 'shortlisted')}
                  >
                    <Text style={styles.shortlistText}>Shortlist</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.statusRow}>
                  <Text
                    style={[
                      styles.statusText,
                      request.status === 'shortlisted' ? styles.statusShortlisted : styles.statusRejected,
                    ]}
                  >
                    {request.status === 'shortlisted' ? 'Shortlisted' : 'Rejected'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HostJobRequestScreen;

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
    borderRadius: wp(16),
    backgroundColor: colors.white,
    marginBottom: hp(16),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  jobTitle: {
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  company: {
    marginTop: hp(10),
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: hp(15),
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
    marginRight: wp(6),
    tintColor: colors.primary,
  },
  metaText: {
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  divider: {
    height: 1,
    marginTop: hp(16),
    marginBottom: hp(14),
    backgroundColor: colors.EBEBEB,
  },
  sectionLabel: {
    marginBottom: hp(10),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  applicantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(60),
    paddingHorizontal: wp(12),
    borderRadius: wp(8),
    borderWidth: 1,
    borderColor: colors.EBEBEB,
    marginBottom: hp(16),
  },
  avatar: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: colors.lightGrayF5F5F5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(12),
  },
  avatarIcon: {
    width: wp(22),
    height: wp(22),
    tintColor: colors.subText,
  },
  applicantName: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  chatIcon: {
    width: wp(20),
    height: wp(20),
  },
  actionRow: {
    flexDirection: 'row',
    gap: wp(12),
  },
  rejectButton: {
    flex: 1,
    height: hp(50),
    borderRadius: wp(25),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightRed,
    borderWidth: 1,
    borderColor: colors.red80,
  },
  rejectText: {
    color: colors.red,
    fontSize: fontSize(15),
    fontFamily: fonts.Lato700,
  },
  shortlistButton: {
    flex: 1,
    height: hp(50),
    borderRadius: wp(25),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGrayF5F5F5,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  shortlistText: {
    color: colors.black,
    fontSize: fontSize(15),
    fontFamily: fonts.Lato700,
  },
  statusRow: {
    alignItems: 'center',
    paddingVertical: hp(12),
  },
  statusText: {
    fontSize: fontSize(15),
    fontFamily: fonts.Lato700,
  },
  statusShortlisted: {
    color: colors.primary,
  },
  statusRejected: {
    color: colors.red,
  },
});
