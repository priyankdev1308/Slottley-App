import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../assets/icons';
import SpaceCard from '../components/SpaceCard';
import LocationPermissionGate from '../components/LocationPermissionGate';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { MySpace, fetchFeaturedPlaces, fetchNearbyPlaces } from '../api/places';
import { useDeviceLocation } from '../hooks/useDeviceLocation';
import { useWishlist } from '../hooks/useWishlist';
import { SpaceListScreenProps } from '../interface/screenTypes';

const TITLES = {
  nearYou: 'Space Near You',
  featured: 'Featured spaces',
};

const LIST_PAGE_SIZE = 10;

const SpaceListScreen = ({ navigation, route }: SpaceListScreenProps) => {
  const { listType } = route.params;

  const { status: locationStatus, coords, canAskAgain, requestLocation, handleGatePress } = useDeviceLocation();
  const { isLiked, toggleLike } = useWishlist();
  const [items, setItems] = useState<MySpace[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = async (pageIndex: number, latitude?: number, longitude?: number) => {
    if (listType === 'nearYou') {
      if (latitude == null || longitude == null) return { rows: [], more: false };
      return fetchNearbyPlaces(latitude, longitude, pageIndex, LIST_PAGE_SIZE);
    }
    return fetchFeaturedPlaces(pageIndex, LIST_PAGE_SIZE);
  };

  useEffect(() => {
    (async () => {
      setLoadingInitial(true);

      let latitude: number | undefined;
      let longitude: number | undefined;
      if (listType === 'nearYou') {
        const coords = await requestLocation();
        if (!coords) {
          setLoadingInitial(false);
          return;
        }
        latitude = coords.latitude;
        longitude = coords.longitude;
      }

      const { rows, more } = await loadPage(0, latitude, longitude);
      setItems(rows);
      setHasMore(more);
      setPage(0);
      setLoadingInitial(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listType]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    if (listType === 'nearYou' && (locationStatus !== 'granted' || !coords)) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const { rows, more } = await loadPage(nextPage, coords?.latitude, coords?.longitude);
    setItems(prev => [...prev, ...rows]);
    setHasMore(more);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const showLocationGate = listType === 'nearYou' && locationStatus === 'denied';

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
          {TITLES[listType]}
        </Text>
        <View style={styles.backButton} />
      </View>

      {showLocationGate ? (
        <LocationPermissionGate canAskAgain={canAskAgain} onPress={handleGatePress} />
      ) : loadingInitial ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No spaces found.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          columnWrapperStyle={styles.row}
          onEndReachedThreshold={0.4}
          onEndReached={handleLoadMore}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.listLoader} />
            ) : null
          }
          renderItem={({ item }) => (
            <SpaceCard
              data={item}
              style={styles.card}
              liked={isLiked(item.id)}
              onToggleLike={() => toggleLike(item.id)}
              onPress={() => navigation.navigate('PlaceDetailScreen', { spaceId: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default SpaceListScreen;

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
    height: 8,
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
  content: {
    paddingHorizontal: wp(20),
    paddingTop: hp(20),
    paddingBottom: hp(30),
    gap: hp(16),
  },
  row: {
    gap: wp(14),
  },
  card: {
    width: '48%',
  },
  listLoader: {
    marginTop: hp(20),
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
});
