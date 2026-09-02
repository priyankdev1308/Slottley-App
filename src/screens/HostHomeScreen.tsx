import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { icons } from '../../assets/icons';
import { CloseIcon } from '../components/icons/CardIcons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { getGreeting } from '../helpers/globalFunctions';
import { useProfileAvatarUrl } from '../hooks/useProfileAvatarUrl';
import { supabase } from '../api/supabaseClient';
import { MySpace, fetchHostPlacesCount, fetchHostPlacesPage } from '../api/places';
import { MainTabScreenProps } from '../navigation/TabNav';

// Page size for the "My Space" list — bump this if a bigger/smaller page is
// wanted; the query below just follows whatever it's set to, no backend
// changes needed.
const SPACES_PAGE_SIZE = 10;

interface DashboardStat {
  key: string;
  icon: ImageSourcePropType;
  value: string;
  label: string;
}

const HostHomeScreen = ({ navigation }: MainTabScreenProps<'Explore'>) => {
  const avatarUrl = useProfileAvatarUrl();

  const [hostId, setHostId] = useState<string | null>(null);
  const [totalPlaces, setTotalPlaces] = useState(0);
  const [spaces, setSpaces] = useState<MySpace[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Resolves the signed-in host and their overall place count once.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        if (!cancelled) setLoadingInitial(false);
        return;
      }
      const userId = authData.user.id;
      if (cancelled) return;
      setHostId(userId);

      const count = await fetchHostPlacesCount(userId);
      if (!cancelled) setTotalPlaces(count);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Debounces the search box so it doesn't re-query on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // (Re)loads page 0 whenever the host resolves or the search term settles.
  useEffect(() => {
    if (!hostId) return;
    let cancelled = false;

    (async () => {
      setLoadingInitial(true);
      const { rows, more } = await fetchHostPlacesPage(hostId, 0, SPACES_PAGE_SIZE, debouncedSearch);
      if (cancelled) return;
      setSpaces(rows);
      setHasMore(more);
      setPage(0);
      setLoadingInitial(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [hostId, debouncedSearch]);

  const handleLoadMore = async () => {
    if (!hostId || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const { rows, more } = await fetchHostPlacesPage(hostId, nextPage, SPACES_PAGE_SIZE, debouncedSearch);
    setSpaces(prev => [...prev, ...rows]);
    setHasMore(more);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const refreshData = async () => {
    if (!hostId) return;

    const [count, pageResult] = await Promise.all([
      fetchHostPlacesCount(hostId),
      fetchHostPlacesPage(hostId, 0, SPACES_PAGE_SIZE, debouncedSearch),
    ]);
    setTotalPlaces(count);
    setSpaces(pageResult.rows);
    setHasMore(pageResult.more);
    setPage(0);
  };

  const handleRefresh = async () => {
    if (!hostId) return;
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Skips the very first focus (handled already by the mount effect above)
  // and silently refreshes on every focus after that — so returning from
  // Add/Edit Place shows the change immediately instead of stale stats/list.
  // Deliberately doesn't toggle `refreshing`: that drives the pull-to-refresh
  // spinner, which should only appear for an actual manual pull gesture.
  const isFirstFocusRef = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocusRef.current) {
        isFirstFocusRef.current = false;
        return;
      }
      refreshData();
    }, [hostId, debouncedSearch]),
  );

  const dashboardStats: DashboardStat[] = [
    { key: 'places', icon: icons.totalPlace, value: String(totalPlaces), label: 'TOTAL PLACE' },
    { key: 'jobs', icon: icons.totalJobs, value: '0', label: 'TOTAL JOBS' },
    { key: 'bookings', icon: icons.totalBooking, value: '0', label: 'TOTAL BOOKING' },
    { key: 'earnings', icon: icons.totalEarning, value: '£0', label: 'TOTAL EARNINGS' },
  ];

  const handleAddSpace = () => {
    navigation.navigate('AddNewPlaceScreen');
  };

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerTop}>
          <View style={styles.avatar}>
            <Image
              source={avatarUrl ? { uri: avatarUrl } : icons.tabProfile}
              style={avatarUrl ? styles.avatarPhoto : styles.avatarIcon}
              resizeMode={avatarUrl ? 'cover' : 'contain'}
            />
          </View>

          <View style={styles.greetingCol}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.heading}>List Your Space. Start Earning.</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('NotificationScreen')}
            style={styles.bellButton}
          >
            <Image
              source={icons.notification}
              style={styles.bellIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Image
            source={icons.search_black}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Type to search..."
            placeholderTextColor={colors.placeHolder}
            style={styles.searchInput}
          />
          {!!searchQuery && (
            <TouchableOpacity
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => setSearchQuery('')}
            >
              <CloseIcon size={14} color={colors.subText} />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <FlatList
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        data={spaces}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.spaceRow}
        onEndReachedThreshold={0.4}
        onEndReached={handleLoadMore}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <>
            <View style={styles.statsGrid}>
              {dashboardStats.map(stat => (
                <View key={stat.key} style={styles.statCard}>
                  <Image source={stat.icon} style={styles.statIcon} resizeMode="contain" />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>My Space</Text>
          </>
        }
        ListEmptyComponent={
          loadingInitial ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.listLoader} />
          ) : (
            <Text style={styles.emptyText}>
              {debouncedSearch
                ? 'No spaces match your search.'
                : "You haven't listed any spaces yet."}
            </Text>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.listLoader} />
          ) : null
        }
        renderItem={({ item: space }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.spaceCard}
            onPress={() => navigation.navigate('HostPlaceDetailScreen', { spaceId: space.id })}
          >
            <View style={styles.spaceImageFrame}>
              <View style={styles.spaceImageWrap}>
                <Image source={space.image} style={styles.spaceImage} resizeMode="cover" />
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>{space.status}</Text>
                </View>
              </View>
            </View>

            <View style={styles.spaceInfo}>
              <Text numberOfLines={1} style={styles.spaceTitle}>
                {space.title}
              </Text>

              {space.cqcRegistered && (
                <View style={styles.cqcRow}>
                  <View style={styles.cqcBadge}>
                    <Text style={styles.cqcBadgeText}>CQC Registered ✓</Text>
                  </View>
                  <Image source={icons.plainInfo} style={styles.cqcInfoIcon} resizeMode="contain" />
                </View>
              )}

              <View style={styles.locationRow}>
                <Image source={icons.mapPin} style={styles.pinIcon} resizeMode="contain" />
                <Text numberOfLines={1} style={styles.location}>
                  {space.location}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.price}>{space.price}</Text>
                <Text style={styles.period}>/{space.period}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity activeOpacity={0.85} style={styles.fab} onPress={handleAddSpace}>
        <Image source={icons.addRound} style={styles.fabIcon} resizeMode="contain" />
        <Text style={styles.fabLabel}>Add Space</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HostHomeScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  header: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: wp(28),
    borderBottomRightRadius: wp(28),
    paddingHorizontal: wp(20),
    paddingBottom: hp(24),
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(12),
  },
  avatar: {
    width: wp(52),
    height: wp(52),
    borderRadius: wp(26),
    backgroundColor: colors.white10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    width: wp(26),
    height: wp(26),
    tintColor: colors.white,
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: wp(26),
  },
  greetingCol: {
    flex: 1,
    marginLeft: wp(12),
  },
  greeting: {
    color: '#CDCDCD',
    fontSize: fontSize(12),
    fontFamily: fonts.Lato600,
  },
  heading: {
    marginTop: hp(4),
    color: colors.white,
    fontSize: fontSize(21),
    lineHeight: fontSize(26),
    fontFamily: fonts.Lato700,
  },
  bellButton: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    backgroundColor: colors.white10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp(10),
  },
  bellIcon: {
    width: wp(20),
    height: wp(20),
    tintColor: colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(52),
    marginTop: hp(20),
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
    fontSize: fontSize(14.5),
    fontFamily: fonts.Lato400,
  },
  scrollContent: {
    paddingHorizontal: wp(20),
    paddingTop: hp(24),
    paddingBottom: hp(100),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(14),
    marginBottom: hp(28),
  },
  statCard: {
    width: '48%',
    height: hp(130),
    borderRadius: wp(14),
    backgroundColor: colors.white,
    padding: wp(16),
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  statIcon: {
    width: wp(40),
    height: wp(40),
    marginBottom: hp(12),
  },
  statValue: {
    color: colors.hostGold,
    fontSize: fontSize(24),
    fontFamily: fonts.Lato700,
  },
  statLabel: {
    marginTop: hp(4),
    color: colors.black,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato700,
  },
  sectionTitle: {
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato700,
    marginBottom: hp(14),
  },
  spaceRow: {
    justifyContent: 'space-between',
  },
  listLoader: {
    marginVertical: hp(20),
  },
  emptyText: {
    marginTop: hp(12),
    textAlign: 'center',
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  spaceCard: {
    width: '48%',
    borderRadius: wp(12),
    backgroundColor: colors.white,
    marginBottom: hp(8),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  spaceImageFrame: {
    padding: wp(3),
  },
  spaceImageWrap: {
    height: hp(120),
    borderRadius: wp(10),
    backgroundColor: colors.lightGrayF5F5F5,
    overflow: 'hidden',
  },
  spaceImage: {
    width: '100%',
    height: '100%',
  },
  activeBadge: {
    position: 'absolute',
    top: wp(10),
    right: wp(10),
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
    borderRadius: wp(20),
    backgroundColor: colors.primary,
  },
  activeBadgeText: {
    color: colors.white,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato700,
  },
  spaceInfo: {
    padding: wp(12),
  },
  spaceTitle: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  cqcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(8),
  },
  cqcBadge: {
    paddingHorizontal: wp(10),
    paddingVertical: hp(6),
    borderRadius: wp(20),
    backgroundColor: colors.sage,
    marginRight: wp(6),
  },
  cqcBadgeText: {
    color: colors.primary,
    fontSize: fontSize(10),
    fontFamily: fonts.Lato500,
  },
  cqcInfoIcon: {
    width: wp(18),
    height: wp(18),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(8),
  },
  pinIcon: {
    width: wp(14),
    height: wp(14),
    marginRight: wp(4),
  },
  location: {
    flex: 1,
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: hp(8),
  },
  price: {
    color: colors.primary,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  period: {
    color: colors.primary,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
    marginLeft: wp(2),
  },
  fab: {
    position: 'absolute',
    right: wp(20),
    bottom: hp(24),
    width: wp(145),
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
