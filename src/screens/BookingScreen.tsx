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
import { images } from '../../assets/images';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { MainTabScreenProps } from '../navigation/TabNav';

type BookingStatus = 'Pending' | 'Complete' | 'Cancelled';

interface Booking {
  id: string;
  title: string;
  location: string;
  time: string;
  date: string;
  price: string;
  status: BookingStatus;
  image: any;
}

const STATUS_STYLES: Record<
  BookingStatus,
  { text: string; bg: string; border: string }
> = {
  Pending: { text: colors.pending, bg: colors.pendingBg, border: colors.pendingBorder },
  Complete: { text: colors.complete, bg: colors.completeBg, border: colors.completeBorder },
  Cancelled: { text: colors.red, bg: colors.lightRed, border: colors.red80 },
};

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    title: 'Premium Nail Desk',
    location: 'London, UK',
    time: '10:00 AM - 12:00 PM',
    date: 'Thur, 20 Aug 2026',
    price: '£120',
    status: 'Pending',
    image: images.dummy1,
  },
  {
    id: 'b2',
    title: 'Hair Apprentice',
    location: 'London, UK',
    time: '12:00 PM - 18:00 PM',
    date: 'Sat, 22 Aug 2026',
    price: '£100',
    status: 'Complete',
    image: images.dummy2,
  },
  {
    id: 'b3',
    title: 'Luxury Beauty Room',
    location: 'London, UK',
    time: '2 Days',
    date: 'Mon, 24 Aug 2026',
    price: '£220',
    status: 'Pending',
    image: images.dummy3,
  },
  {
    id: 'b4',
    title: 'Modern Barbershop',
    location: 'London, UK',
    time: '09:00 AM - 10:00 AM',
    date: 'Wed, 26 Aug 2026',
    price: '£65',
    status: 'Cancelled',
    image: images.dummy1,
  },
];

const BookingScreen = (_props: MainTabScreenProps<'Booking'>) => {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);

  const cancelBooking = (id: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () =>
            setBookings(prev =>
              prev.map(b => (b.id === id ? { ...b, status: 'Cancelled' as const } : b)),
            ),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerShadowStrip} />
        <Text style={styles.headerTitle}>My Booking</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {bookings.map(booking => {
          const statusStyle = STATUS_STYLES[booking.status];
          return (
            <View key={booking.id} style={styles.card}>
              <View style={styles.topRow}>
                <Image source={booking.image} style={styles.thumbnail} resizeMode="cover" />
                <View style={styles.titleCol}>
                  <Text style={styles.title}>{booking.title}</Text>
                  <View style={styles.locationRow}>
                    <Image
                      source={icons.mapPin}
                      style={styles.metaIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.locationText}>{booking.location}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {booking.status}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Image source={icons.clock} style={styles.metaIcon} resizeMode="contain" />
                  <Text style={styles.detailText}>{booking.time}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Image
                    source={icons.calendar}
                    style={styles.metaIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.detailText}>{booking.date}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Image source={icons.money} style={styles.metaIcon} resizeMode="contain" />
                <Text style={styles.detailText}>{booking.price}</Text>
              </View>

              {booking.status !== 'Cancelled' && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.cancelButton}
                  onPress={() => cancelBooking(booking.id)}
                >
                  <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingScreen;

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
  card: {
    padding: wp(16),
    borderRadius: wp(8),
    backgroundColor: colors.white,
    marginBottom: hp(20),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: wp(60),
    height: wp(60),
    borderRadius: wp(12),
    marginRight: wp(12),
  },
  titleCol: {
    flex: 1,
  },
  title: {
    color: colors.black,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato700,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(6),
  },
  locationText: {
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  statusBadge: {
    paddingHorizontal: wp(14),
    paddingVertical: hp(7),
    borderRadius: wp(20),
    borderWidth: 1,
  },
  statusText: {
    fontSize: fontSize(12.5),
    fontFamily: fonts.Lato700,
  },
  detailRow: {
    flexDirection: 'row',
    marginTop: hp(16),
    marginBottom: hp(10),
    gap: wp(20),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    width: wp(18),
    height: wp(18),
    marginRight: wp(6),
  },
  detailText: {
    color: colors.black,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  cancelButton: {
    height: hp(50),
    marginTop: hp(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(25),
    backgroundColor: colors.primary10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.primary,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
});
