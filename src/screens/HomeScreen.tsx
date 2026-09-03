import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SpaceCard from '../components/SpaceCard';
import CqcInfoModal from '../components/CqcInfoModal';
import LocationPermissionGate from '../components/LocationPermissionGate';
import { CloseIcon } from '../components/icons/CardIcons';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { supabase } from '../api/supabaseClient';
import { getGreeting } from '../helpers/globalFunctions';
import { useProfileAvatarUrl } from '../hooks/useProfileAvatarUrl';
import { useDeviceLocation } from '../hooks/useDeviceLocation';
import { useWishlist } from '../hooks/useWishlist';
import { MySpace, fetchFeaturedPlaces, fetchNearbyPlaces, searchPlaces } from '../api/places';
import { MainTabScreenProps } from '../navigation/TabNav';

const CQC_INFO_SEEN_KEY_PREFIX = 'cqc_info_seen_';
const HOME_PREVIEW_COUNT = 5;
const SEARCH_PAGE_SIZE = 20;

const HomeScreen = ({ navigation }: MainTabScreenProps<'Explore'>) => {
  const [cqcModalVisible, setCqcModalVisible] = useState(false);
  const avatarUrl = useProfileAvatarUrl();

  const { status: locationStatus, coords, canAskAgain, requestLocation, handleGatePress } = useDeviceLocation();
  const { isLiked, toggleLike } = useWishlist();
  const [nearYou, setNearYou] = useState<MySpace[]>([]);
  const [loadingNearYou, setLoadingNearYou] = useState(false);
  const [featured, setFeatured] = useState<MySpace[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchResults, setSearchResults] = useState<MySpace[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      const seenKey = `${CQC_INFO_SEEN_KEY_PREFIX}${data.user.id}`;
      const alreadySeen = await AsyncStorage.getItem(seenKey);
      if (!alreadySeen) {
        setCqcModalVisible(true);
        await AsyncStorage.setItem(seenKey, 'true');
      }
    })();
  }, []);

  const loadFeatured = async () => {
    const { rows } = await fetchFeaturedPlaces(0, HOME_PREVIEW_COUNT);
    setFeatured(rows);
  };

  const loadNearYou = async (latitude: number, longitude: number) => {
    const { rows } = await fetchNearbyPlaces(latitude, longitude, 0, HOME_PREVIEW_COUNT);
    setNearYou(rows);
  };

  useEffect(() => {
    (async () => {
      setLoadingFeatured(true);
      await loadFeatured();
      setLoadingFeatured(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const position = await requestLocation();
      if (!position) return;

      setLoadingNearYou(true);
      await loadNearYou(position.latitude, position.longitude);
      setLoadingNearYou(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounces the search box so it doesn't re-query on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedSearch) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    setSearching(true);

    (async () => {
      const { rows } = await searchPlaces(debouncedSearch, 0, SEARCH_PAGE_SIZE);
      if (!cancelled) {
        setSearchResults(rows);
        setSearching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  const onRefresh = async () => {
    setRefreshing(true);
    const tasks = [loadFeatured()];
    if (locationStatus === 'granted' && coords) {
      tasks.push(loadNearYou(coords.latitude, coords.longitude));
    }
    await Promise.all(tasks);
    setRefreshing(false);
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
            <Text style={styles.heading}>Find a Space That Works For You</Text>
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
              style={styles.searchClearButton}
            >
              <CloseIcon size={14} color={colors.subText} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FilterScreen')}
          >
            <Image source={icons.filter} style={styles.filterIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {debouncedSearch ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Search Results</Text>
            </View>
            {searching ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.sectionLoader} />
            ) : searchResults.length === 0 ? (
              <Text style={styles.emptyText}>No spaces match "{debouncedSearch}".</Text>
            ) : (
              <View style={styles.searchGrid}>
                {searchResults.map(item => (
                  <SpaceCard
                    key={item.id}
                    data={item}
                    style={styles.searchGridCard}
                    liked={isLiked(item.id)}
                    onToggleLike={() => toggleLike(item.id)}
                    onPress={() => navigation.navigate('PlaceDetailScreen', { spaceId: item.id })}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Spaces Near You</Text>
              {locationStatus === 'granted' && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('SpaceListScreen', { listType: 'nearYou' })}
                >
                  <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
              )}
            </View>
            {locationStatus === 'denied' ? (
              <LocationPermissionGate canAskAgain={canAskAgain} onPress={handleGatePress} />
            ) : locationStatus === 'loading' || loadingNearYou ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.sectionLoader} />
            ) : nearYou.length === 0 ? (
              <Text style={styles.emptyText}>No spaces found near you yet.</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardRow}
              >
                {nearYou.map(item => (
                  <SpaceCard
                    key={item.id}
                    data={item}
                    liked={isLiked(item.id)}
                    onToggleLike={() => toggleLike(item.id)}
                    onPress={() => navigation.navigate('PlaceDetailScreen', { spaceId: item.id })}
                  />
                ))}
              </ScrollView>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured spaces</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('SpaceListScreen', { listType: 'featured' })}
              >
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {loadingFeatured ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.sectionLoader} />
            ) : featured.length === 0 ? (
              <Text style={styles.emptyText}>No spaces available yet.</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardRow}
              >
                {featured.map(item => (
                  <SpaceCard
                    key={item.id}
                    data={item}
                    liked={isLiked(item.id)}
                    onToggleLike={() => toggleLike(item.id)}
                    onPress={() => navigation.navigate('PlaceDetailScreen', { spaceId: item.id })}
                  />
                ))}
              </ScrollView>
            )}
          </>
        )}
      </ScrollView>

      <CqcInfoModal visible={cqcModalVisible} onClose={() => setCqcModalVisible(false)} />
    </View>
  );
};

export default HomeScreen;

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
  searchClearButton: {
    marginRight: wp(10),
  },
  searchDivider: {
    width: 1,
    height: hp(22),
    marginHorizontal: wp(12),
    backgroundColor: colors.EBEBEB,
  },
  filterIcon: {
    width: wp(20),
    height: wp(20),
  },
  scrollContent: {
    paddingTop: hp(24),
    paddingBottom: hp(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(20),
    marginBottom: hp(14),
  },
  sectionTitle: {
    color: colors.black,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato700,
  },
  viewAll: {
    color: colors.black,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato700,
    textDecorationLine: 'underline',
  },
  cardRow: {
    paddingHorizontal: wp(20),
    gap: wp(14),
    marginBottom: hp(28),
  },
  searchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp(20),
  },
  searchGridCard: {
    width: '48%',
    marginBottom: hp(16),
  },
  sectionLoader: {
    marginBottom: hp(28),
  },
  emptyText: {
    paddingHorizontal: wp(20),
    marginBottom: hp(28),
    color: colors.subText,
    fontSize: fontSize(13.5),
    fontFamily: fonts.Lato400,
  },
});
