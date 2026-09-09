import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { MainTabScreenProps } from '../navigation/TabNav';
import ToastAlert from '../components/ToastAlert';
import { BookingDetail, BookingStatus, cancelBooking, fetchMyBookingsPage } from '../api/bookings';

const LIST_PAGE_SIZE = 10;

const STATUS_STYLES: Record<
  BookingStatus,
  { text: string; bg: string; border: string }
> = {
  Pending: { text: colors.pending, bg: colors.pendingBg, border: colors.pendingBorder },
  Confirmed: { text: colors.complete, bg: colors.completeBg, border: colors.completeBorder },
  Cancelled: { text: colors.red, bg: colors.lightRed, border: colors.red80 },
};

const BookingScreen = (_props: MainTabScreenProps<'Booking'>) => {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoadingInitial(true);

      (async () => {
        const { rows, more } = await fetchMyBookingsPage(0, LIST_PAGE_SIZE);
        if (!cancelled) {
          setBookings(rows);
          setHasMore(more);
          setPage(0);
          setLoadingInitial(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    const { rows, more } = await fetchMyBookingsPage(0, LIST_PAGE_SIZE);
    setBookings(rows);
    setHasMore(more);
    setPage(0);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const { rows, more } = await fetchMyBookingsPage(nextPage, LIST_PAGE_SIZE);
    setBookings(prev => [...prev, ...rows]);
    setHasMore(more);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const handleCancelBooking = (id: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const ok = await cancelBooking(id);
            if (!ok) {
              ToastAlert({ title: 'Could not cancel booking', description: 'Please try again.' });
              return;
            }
            setBookings(prev =>
              prev.map(b => (b.id === id ? { ...b, status: 'Cancelled' as const } : b)),
            );
          },
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

      {loadingInitial ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No bookings yet.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={handleLoadMore}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.listLoader} />
            ) : null
          }
          renderItem={({ item: booking }) => {
            const statusStyle = STATUS_STYLES[booking.status];
            return (
              <View style={styles.card}>
                <View style={styles.topRow}>
                  <Image source={booking.placeImage} style={styles.thumbnail} resizeMode="cover" />
                  <View style={styles.titleCol}>
                    <Text style={styles.title}>{booking.placeTitle}</Text>
                    <View style={styles.locationRow}>
                      <Image
                        source={icons.mapPin}
                        style={styles.metaIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.locationText}>{booking.placeLocation}</Text>
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
                    <Text style={styles.detailText}>{booking.timeLabel}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Image
                      source={icons.calendar}
                      style={styles.metaIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.detailText}>{booking.dateLabel}</Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <Image source={icons.money} style={styles.metaIcon} resizeMode="contain" />
                  <Text style={styles.detailText}>£{booking.totalPrice}</Text>
                </View>

                {booking.status !== 'Cancelled' && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.cancelButton}
                    onPress={() => handleCancelBooking(booking.id)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listLoader: {
    marginTop: hp(20),
  },
  emptyText: {
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
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
