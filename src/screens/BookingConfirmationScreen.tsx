import React from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import { icons } from '../../assets/icons';
import { images } from '../../assets/images';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { BookingConfirmationScreenProps } from '../interface/screenTypes';

// Mock — will come from the confirmed booking API response.
const BOOKING = {
  title: 'Hair Apprentice',
  location: 'London, UK',
  bookingId: '#BK2026125898',
  time: '10:00 - 18:00',
  date: 'Mon, 20 Aug 2026',
  price: '£120',
  image: images.dummy2,
};

const BookingConfirmationScreen = ({ navigation }: BookingConfirmationScreenProps) => {
  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <Image
          source={icons.confirmBooking}
          style={styles.successIcon}
          resizeMode="contain"
        />
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your Booking has been confirmed. You will receive a confirmation email shortly.
        </Text>

        <View style={styles.card}>
          <View style={styles.topRow}>
            <Image source={BOOKING.image} style={styles.bookingImage} resizeMode="cover" />
            <View style={styles.bookingTextCol}>
              <Text style={styles.bookingTitle}>{BOOKING.title}</Text>
              <View style={styles.metaRow}>
                <Image source={icons.mapPin} style={styles.metaIcon} resizeMode="contain" />
                <Text style={styles.bookingLocation}>{BOOKING.location}</Text>
              </View>
            </View>
            <View style={styles.bookingIdCol}>
              <Text style={styles.bookingIdLabel}>Booking ID:</Text>
              <Text style={styles.bookingIdValue}>{BOOKING.bookingId}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Image source={icons.clock} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.detailText}>{BOOKING.time}</Text>
            </View>
            <View style={styles.detailItem}>
              <Image source={icons.calendar} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.detailText}>{BOOKING.date}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Image source={icons.money} style={styles.metaIcon} resizeMode="contain" />
            <Text style={styles.detailText}>{BOOKING.price}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <CustomButton
          title="Back To Home"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
        />
      </View>
    </SafeAreaView>
  );
};

export default BookingConfirmationScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: wp(20),
    paddingTop: hp(60),
  },
  successIcon: {
    width: wp(100),
    height: wp(100),
  },
  title: {
    marginTop: hp(24),
    color: colors.black,
    fontSize: fontSize(28),
    fontFamily: fonts.Lato700,
  },
  subtitle: {
    marginTop: hp(10),
    color: colors.subText,
    fontSize: fontSize(16),
    lineHeight: fontSize(21),
    textAlign: 'center',
    fontFamily: fonts.Lato500,
    fontWeight: 500
  },
  card: {
    width: '100%',
    marginTop: hp(36),
    padding: wp(16),
    borderRadius: wp(16),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.EBEBEB,
  },
  topRow: {
    flexDirection: 'row',
  },
  bookingImage: {
    width: wp(56),
    height: wp(56),
    borderRadius: wp(12),
    marginRight: wp(12),
  },
  bookingTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  bookingTitle: {
    color: colors.black,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato700,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(6),
  },
  bookingLocation: {
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
    fontWeight: 500
  },
  bookingIdCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bookingIdLabel: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato600,
    fontWeight: 600
  },
  bookingIdValue: {
    marginTop: hp(2),
    color: colors.primary,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  divider: {
    height: 1,
    backgroundColor: colors.EBEBEB,
    marginVertical: hp(14),
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: hp(10),
    gap: wp(20),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    width: wp(16),
    height: wp(16),
    marginRight: wp(6),
  },
  detailText: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  footer: {
    paddingHorizontal: wp(20),
    paddingBottom: hp(16),
  },
});
