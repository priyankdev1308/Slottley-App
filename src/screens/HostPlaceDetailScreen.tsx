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
  Alert,
  ImageSourcePropType,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import CustomButton from '../components/CustomButton';
import ReadMoreText from '../components/ReadMoreText';
import ToastAlert from '../components/ToastAlert';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, screenWidth, wp } from '../helpers/responsive';
import { HostPlaceDetailScreenProps } from '../interface/screenTypes';
import { supabase } from '../api/supabaseClient';
import { MySpace, PLACE_IMAGE_BUCKET, fetchPlaceById } from '../api/places';

const AMENITY_ICONS: Record<string, ImageSourcePropType> = {
  'Wi-Fi': icons.wifi,
  Mirror: icons.mirror,
  'Music System': icons.music,
  'Fan & AC': icons.fan,
  Lights: icons.light,
  Towels: icons.towel,
};

const HostPlaceDetailScreen = ({ navigation, route }: HostPlaceDetailScreenProps) => {
  const spaceId = route.params?.spaceId;

  const [space, setSpace] = useState<MySpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Re-fetches every time this screen regains focus — not just on mount —
  // so returning from Edit shows the just-saved changes instead of stale data.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);

      (async () => {
        if (!spaceId) {
          setLoading(false);
          return;
        }
        const result = await fetchPlaceById(spaceId);
        if (cancelled) return;
        setSpace(result);
        setLoading(false);
      })();

      return () => {
        cancelled = true;
      };
    }, [spaceId]),
  );

  const gallery = space?.gallery ?? [];

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setActiveImage(index);
  };

  const handleStatusChange = async (option: 'Active' | 'Inactive') => {
    setStatusMenuOpen(false);
    if (!space || option === space.status) return;

    setUpdatingStatus(true);
    const { error } = await supabase.from('places').update({ status: option }).eq('id', space.id);
    setUpdatingStatus(false);

    if (error) {
      ToastAlert({ title: 'Could not update status', description: error.message });
      return;
    }
    setSpace(prev => (prev ? { ...prev, status: option } : prev));
  };

  const handleDelete = () => {
    if (!space) return;
    Alert.alert('Delete Space', `Are you sure you want to delete "${space.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          if (space.imagePaths.length > 0) {
            await supabase.storage.from(PLACE_IMAGE_BUCKET).remove(space.imagePaths);
          }
          const { error } = await supabase.from('places').delete().eq('id', space.id);
          setDeleting(false);

          if (error) {
            ToastAlert({ title: 'Could not delete space', description: error.message });
            return;
          }
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.flex} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!space) {
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
          <Text style={styles.headerTitle}>Place Detail</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingWrap}>
          <Text style={styles.emptyText}>This space could not be found.</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Place Detail</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
        <View style={styles.galleryWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onGalleryScroll}
          >
            {gallery.map((image, index) => (
              <View key={index} style={styles.galleryPage}>
                <Image source={image} style={styles.galleryImage} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.statusBadge}
            disabled={updatingStatus}
            onPress={() => setStatusMenuOpen(v => !v)}
          >
            <View style={styles.statusDot} />
            {updatingStatus ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Text style={styles.statusBadgeText}>{space.status}</Text>
                <Image source={icons.downArrow} style={styles.statusChevron} resizeMode="contain" />
              </>
            )}
          </TouchableOpacity>

          {statusMenuOpen && (
            <View style={styles.statusMenu}>
              {(['Active', 'Inactive'] as const).map(option => (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.8}
                  style={styles.statusMenuItem}
                  onPress={() => handleStatusChange(option)}
                >
                  <Text style={styles.statusMenuText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={styles.dotsRow}>
          {gallery.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeImage && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{space.title}</Text>
            <Text style={styles.price}>
              {space.price}/ <Text style={styles.pricePeriod}>{space.period}</Text>
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Image source={icons.mapPin} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.metaText}>{space.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Image source={icons.star} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.metaText}>
                {space.rating} ({space.reviewCount} reviews)
              </Text>
            </View>
          </View>

          <View style={styles.categoryCard}>
            <Text style={styles.categoryTitle}>{space.category}</Text>
            <Text style={styles.categoryHint}>{space.categoryHint}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>About This Space</Text>
          <ReadMoreText
            text={space.description}
            numberOfLines={3}
            style={styles.aboutText}
            linkStyle={styles.readMore}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Amenities</Text>
          {space.amenities.length > 0 ? (
            <View style={styles.amenitiesRow}>
              {space.amenities.map(label => (
                <View key={label} style={styles.amenityItem}>
                  <Image
                    source={AMENITY_ICONS[label] ?? icons.checkGreen}
                    style={styles.amenityIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.amenityLabel}>{label}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No amenities added.</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>What’s Include</Text>
          {space.includedItems.length > 0 ? (
            <View style={styles.includedRow}>
              {space.includedItems.map(item => (
                <View key={item} style={styles.includedChip}>
                  <Image source={icons.checkGreen} style={styles.includedIcon} resizeMode="contain" />
                  <Text style={styles.includedLabel}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Nothing added yet.</Text>
          )}

          <View style={styles.divider} />

          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionLabel}>Reviews</Text>
          </View>
          <Text style={styles.emptyText}>No reviews yet.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Edit"
          onPress={() => navigation.navigate('AddNewPlaceScreen', { placeId: space.id })}
          buttonStyle={styles.editButton}
          textStyle={styles.editButtonText}
          disable={deleting}
        />
        <CustomButton
          title="Delete"
          onPress={handleDelete}
          buttonStyle={styles.deleteButton}
          textStyle={styles.deleteButtonText}
          loader={deleting}
          loaderColor={colors.red}
          disable={deleting}
        />
      </View>
    </SafeAreaView>
  );
};

export default HostPlaceDetailScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.subText,
    fontSize: fontSize(13.5),
    fontFamily: fonts.Lato400,
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
  galleryWrap: {
    paddingHorizontal: wp(20),
    paddingTop: hp(20)
  },
  galleryPage: {
    width: screenWidth - wp(40),
  },
  galleryImage: {
    width: '100%',
    height: hp(230),
    borderRadius: wp(14),
  },
  statusBadge: {
    position: 'absolute',
    top: hp(35),
    right: wp(34),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
    borderRadius: wp(20),
    backgroundColor: colors.primary,
  },
  statusDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: colors.white,
    marginRight: wp(6),
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato600,
  },
  statusChevron: {
    width: wp(12),
    height: wp(12),
    marginLeft: wp(6),
    tintColor: '#DAA03A',
  },
  statusMenu: {
    position: 'absolute',
    top: hp(70),
    right: wp(34),
    minWidth: wp(120),
    borderRadius: wp(14),
    backgroundColor: colors.white,
    paddingVertical: hp(4),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 20,
  },
  statusMenuItem: {
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
  },
  statusMenuText: {
    color: colors.black,
    fontSize: fontSize(14.5),
    fontFamily: fonts.Lato500,
  },
  dotsRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: hp(10),
    gap: wp(5),
  },
  dot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: colors.EBEBEB,
  },
  dotActive: {
    width: wp(16),
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: wp(20),
    paddingBottom: hp(30),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: hp(16),
  },
  title: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize(24),
    fontFamily: fonts.Lato700,
    marginRight: wp(10),
  },
  price: {
    color: colors.primary,
    fontSize: fontSize(28),
    fontFamily: fonts.Lato700,
  },
  pricePeriod: {
    color: colors.primary,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato500,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(10),
    gap: wp(16),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    width: wp(14),
    height: wp(14),
    marginRight: wp(5),
  },
  metaText: {
    color: colors.subText,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato400,
  },
  categoryCard: {
    marginTop: hp(16),
    padding: wp(16),
    borderRadius: wp(14),
    backgroundColor: colors.primaryLight,
  },
  categoryTitle: {
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato500,
  },
  categoryHint: {
    marginTop: hp(6),
    color: colors.subText,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato400,
  },
  divider: {
    height: 1,
    marginVertical: hp(20),
    backgroundColor: colors.EBEBEB,
  },
  sectionLabel: {
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
    marginBottom: hp(12),
  },
  aboutText: {
    color: colors.subText,
    fontSize: fontSize(14),
    lineHeight: fontSize(20),
    fontFamily: fonts.Lato400,
  },
  readMore: {
    marginTop: hp(4),
    color: colors.black,
    fontSize: fontSize(13.5),
    fontFamily: fonts.Lato700,
    textDecorationLine: 'underline',
  },
  amenitiesRow: {
    flexDirection: 'row',
  },
  amenityItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: wp(2),
  },
  amenityIcon: {
    width: wp(20),
    height: wp(20),
    marginBottom: hp(8),
  },
  amenityLabel: {
    color: colors.black,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
    textAlign: 'center',
  },
  includedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(14),
  },
  includedChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  includedIcon: {
    width: wp(16),
    height: wp(16),
    marginRight: wp(6),
  },
  includedLabel: {
    color: colors.black,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato400,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(12),
  },
  viewAll: {
    color: colors.black,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato700,
    marginRight: wp(4),
  },
  viewAllArrow: {
    width: wp(12),
    height: wp(12),
    tintColor: colors.black,
  },
  reviewRow: {
    flexDirection: 'row',
  },
  reviewAvatar: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: colors.lightGrayF5F5F5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(12),
  },
  reviewAvatarIcon: {
    width: wp(22),
    height: wp(22),
    tintColor: colors.subText,
  },
  reviewTextCol: {
    flex: 1,
  },
  reviewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewName: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
    marginRight: wp(8),
  },
  reviewTime: {
    color: colors.subText,
    fontSize: fontSize(11.5),
    fontFamily: fonts.Lato400,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: hp(4),
    marginBottom: hp(6),
  },
  starIcon: {
    width: wp(13),
    height: wp(13),
    marginRight: wp(2),
  },
  reviewText: {
    color: colors.subText,
    fontSize: fontSize(14),
    lineHeight: fontSize(18),
    fontFamily: fonts.Lato500,
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
