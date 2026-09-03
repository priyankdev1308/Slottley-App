import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import SpaceCard from '../components/SpaceCard';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { hp, wp, fontSize } from '../helpers/responsive';
import { WishlistScreenProps } from '../interface/screenTypes';
import { MySpace } from '../api/places';
import { fetchWishlistPlaces, removeFromWishlist } from '../api/wishlist';
import { supabase } from '../api/supabaseClient';

const WishlistScreen = ({ navigation }: WishlistScreenProps) => {
  const [wishlist, setWishlist] = useState<MySpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);

      (async () => {
        const { data } = await supabase.auth.getUser();
        const uid = data.user?.id ?? null;
        if (cancelled) return;
        setUserId(uid);

        if (!uid) {
          setWishlist([]);
          setLoading(false);
          return;
        }

        const places = await fetchWishlistPlaces(uid);
        if (!cancelled) {
          setWishlist(places);
          setLoading(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handleRemove = async (placeId: string) => {
    if (!userId) return;

    const previous = wishlist;
    setWishlist(prev => prev.filter(item => item.id !== placeId));

    const ok = await removeFromWishlist(userId, placeId);
    if (!ok) setWishlist(previous);
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
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : wishlist.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>Your wishlist is empty.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {wishlist.map(item => (
              <SpaceCard
                key={item.id}
                data={item}
                liked
                style={styles.gridCard}
                onToggleLike={() => handleRemove(item.id)}
                onPress={() => navigation.navigate('PlaceDetailScreen', { spaceId: item.id })}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default WishlistScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    marginBottom: hp(16),
  },
});
