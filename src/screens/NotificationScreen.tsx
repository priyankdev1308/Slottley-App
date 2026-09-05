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

import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { NotificationScreenProps } from '../interface/screenTypes';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

// TODO: replace with the signed-in user's real notifications once this
// screen is wired to a backend.
const NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Booking Cancelled',
    description:
      'Your booking with Emma Brown for the Premium Nail Desk on March 30th has been cancelled.',
    time: '1h',
    unread: true,
  },
  {
    id: '2',
    title: 'Booking Confirmed',
    description:
      'Your booking for Private Aesthetic Room on April 7th at 11 AM has been confirmed.',
    time: '1h',
    unread: false,
  },
  {
    id: '3',
    title: 'Booking Request Accepted',
    description: 'Your booking request for Luxury Beauty Room has been accepted by the host.',
    time: '1h',
    unread: true,
  },
  {
    id: '4',
    title: 'Booking Request Pending',
    description:
      'Your booking request for Aesthetics Room has been sent to the host and is awaiting confirmation.',
    time: '1h',
    unread: false,
  },
  {
    id: '5',
    title: 'Review Reminder',
    description: 'How was your experience? Leave a review for your recent booking at Modern Beauty Studio.',
    time: '1h',
    unread: false,
  },
];

const NotificationScreen = ({ navigation }: NotificationScreenProps) => {
  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerShadowStrip} />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>
          Notification
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {NOTIFICATIONS.map(item => (
          <View
            key={item.id}
            style={[styles.row, item.unread && styles.rowUnread]}
          >
            <View style={styles.bellCircle}>
              <Image source={icons.notification} style={styles.bellIcon} />
            </View>

            <View style={styles.textCol}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
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
    height: 3,
    backgroundColor: colors.screenBgColor,
    ...headerShadow,
  },
  backButton: {
    width: wp(38),
    height: wp(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: wp(32),
    height: wp(32),
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
  },
  scrollContent: {
    paddingTop: hp(20),
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: wp(20),
    paddingVertical: hp(16),
    gap: wp(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.EBEBEB,
  },
  rowUnread: {
    backgroundColor: colors.EBEBEB,
  },
  bellCircle: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(24),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    width: wp(22),
    height: wp(22),
    resizeMode: 'contain',
    tintColor: colors.white,
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    color: colors.primary,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato600,
  },
  time: {
    marginLeft: wp(8),
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  description: {
    marginTop: hp(4),
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
    lineHeight: fontSize(17),
  },
});
