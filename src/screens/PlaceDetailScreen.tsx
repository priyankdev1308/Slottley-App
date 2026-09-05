import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageSourcePropType,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Circle } from 'react-native-maps';

import CustomButton from '../components/CustomButton';
import ReadMoreText from '../components/ReadMoreText';
import AddReviewModal from '../components/AddReviewModal';
import ToastAlert from '../components/ToastAlert';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, screenWidth, wp } from '../helpers/responsive';
import { PlaceDetailScreenProps } from '../interface/screenTypes';
import { MySpace, HostSummary, fetchPlaceById, fetchHostSummary } from '../api/places';
import { useWishlist } from '../hooks/useWishlist';

const AMENITY_ICONS: Record<string, ImageSourcePropType> = {
  'Wi-Fi': icons.wifi,
  Mirror: icons.mirror,
  'Music System': icons.music,
  'Fan & AC': icons.fan,
  Lights: icons.light,
  Towels: icons.towel,
};

// Only the durations the host actually priced & enabled are bookable —
// a tier with no price (or price 0) never shows as an option.
const getBookingOptions = (space: MySpace): string[] =>
  [
    { key: 'Hourly', available: space.hourlyEnabled && !!space.hourlyPrice },
    { key: 'Daily', available: space.dailyEnabled && !!space.dailyPrice },
    { key: 'Weekly', available: space.weeklyEnabled && !!space.weeklyPrice },
    { key: 'Monthly', available: space.monthlyEnabled && !!space.monthlyPrice },
  ]
    .filter(tier => tier.available)
    .map(tier => tier.key);

const PlaceDetailScreen = ({ navigation, route }: PlaceDetailScreenProps) => {
  const spaceId = route.params?.spaceId;

  const [space, setSpace] = useState<MySpace | null>(null);
  const [host, setHost] = useState<HostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLiked, toggleLike } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [bookingFor, setBookingFor] = useState('Hourly');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

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

        if (result) {
          const hostResult = await fetchHostSummary(result.hostId);
          if (!cancelled) setHost(hostResult);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [spaceId]),
  );

  const gallery = space?.gallery ?? [];

  // Whenever the loaded space's bookable durations change, make sure the
  // current selection is actually one of them (e.g. a place with only Daily
  // priced shouldn't stay stuck on the default "Hourly").
  useEffect(() => {
    if (!space) return;
    const available = getBookingOptions(space);
    if (available.length > 0 && !available.includes(bookingFor)) {
      setBookingFor(available[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space]);

  const handleSubmitReview = (rating: number, text: string) => {
    // TODO: persist to a reviews table once one exists — for now just
    // confirm receipt so the flow is usable end-to-end.
    setReviewModalVisible(false);
    ToastAlert({ title: 'Review submitted', description: `Thanks for your ${rating}-star review!` });
  };

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setActiveImage(index);
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

  const bookingOptions = getBookingOptions(space);

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
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => toggleLike(space.id)}
          style={styles.likeButton}
        >
          <Image
            source={isLiked(space.id) ? icons.wishlist : icons.likeBlack}
            style={styles.likeIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
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

          {space.instantBooking && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Instant Booking Available</Text>
            </View>
          )}

          {space.cqcRegistered && (
            <View style={styles.cqcNotice}>
              <Text style={styles.cqcNoticeTitle}>ⓘ CQC Registered ✓</Text>
              <Text style={styles.cqcNoticeText}>
                CQC registration status is self-declared by the host and verified by Slottley
                against the public register where indicated. Absence of this badge does not imply
                non-compliance. Practitioners are responsible for confirming a space meets
                requirements for their specific treatments.
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>About This Space</Text>
          {space.description ? (
            <ReadMoreText
              text={space.description}
              numberOfLines={3}
              style={styles.aboutText}
              linkStyle={styles.readMore}
            />
          ) : (
            <Text style={styles.emptyText}>No description added.</Text>
          )}

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

          <Text style={styles.sectionLabel}>What’s Included</Text>
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

          <Text style={styles.sectionLabel}>Host</Text>
          <View style={styles.hostRow}>
            <View style={styles.hostAvatar}>
              <Image
                source={host?.avatarUrl ? { uri: host.avatarUrl } : icons.tabProfile}
                style={host?.avatarUrl ? styles.hostAvatarPhoto : styles.hostAvatarIcon}
                resizeMode={host?.avatarUrl ? 'cover' : 'contain'}
              />
            </View>
            <Text style={styles.hostName}>{host?.name ?? 'Host'}</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ChatDetailScreen', {
                  contactId: space.hostId,
                  name: host?.name ?? 'Host',
                })
              }
            >
              <Image source={icons.chat} style={styles.chatIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Location</Text>
          <View style={styles.locationBox}>
            <Text style={styles.locationText}>{space.location}</Text>
          </View>
          {space.latitude != null && space.longitude != null && (
            <View style={styles.mapWrap}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: space.latitude,
                  longitude: space.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Circle
                  center={{ latitude: space.latitude, longitude: space.longitude }}
                  radius={300}
                  strokeColor={colors.primary}
                  strokeWidth={2}
                  fillColor="rgba(21,53,41,0.15)"
                />
              </MapView>
            </View>
          )}

          {bookingOptions.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Booking For</Text>
              <View style={styles.bookingRow}>
                {bookingOptions.map(option => {
                  const isSelected = bookingFor === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      activeOpacity={0.85}
                      onPress={() => setBookingFor(option)}
                      style={[styles.bookingPill, isSelected && styles.bookingPillSelected]}
                    >
                      <Text
                        style={[styles.bookingText, isSelected && styles.bookingTextSelected]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionLabel}>Reviews</Text>
          </View>
          <Text style={styles.emptyText}>No reviews yet.</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setReviewModalVisible(true)}
            style={styles.addReviewButton}
          >
            <Text style={styles.addReviewText}>Add Review</Text>
          </TouchableOpacity>

          <CustomButton
            title="Book Instantly"
            onPress={() =>
              navigation.navigate('BookPlaceScreen', {
                spaceId: space.id,
                mode:
                  bookingFor === 'Weekly'
                    ? 'weekly'
                    : bookingFor === 'Monthly'
                      ? 'monthly'
                      : 'single',
              })
            }
            buttonStyle={styles.bookButton}
          />
        </View>
      </ScrollView>

      <AddReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleSubmitReview}
      />
    </SafeAreaView>
  );
};

export default PlaceDetailScreen;

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
    fontWeight: 600
  },
  likeButton: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeIcon: {
    width: wp(30),
    height: wp(30),
  },
  galleryPage: {
    width: screenWidth,
    paddingHorizontal: wp(20),
    paddingTop: hp(15)
  },
  galleryImage: {
    width: '100%',
    height: hp(230),
    borderRadius: wp(14),
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
  badge: {
    alignSelf: 'flex-start',
    marginTop: hp(14),
    paddingHorizontal: wp(14),
    paddingVertical: hp(8),
    borderRadius: wp(20),
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  badgeText: {
    color: colors.black,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato700,
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
  cqcNotice: {
    marginTop: hp(16),
    padding: wp(14),
    borderRadius: wp(12),
    backgroundColor: colors.primaryLight,
  },
  cqcNoticeTitle: {
    color: colors.primary,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato600,
  },
  cqcNoticeText: {
    marginTop: hp(8),
    color: colors.darkGray,
    fontSize: fontSize(12),
    lineHeight: fontSize(17),
    fontFamily: fonts.Lato600,
  },
  amenitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amenityItem: {
    alignItems: 'center',
    width: wp(60),
  },
  amenityIcon: {
    width: wp(24),
    height: wp(24),
    marginBottom: hp(8),
  },
  amenityLabel: {
    color: colors.darkGray,
    fontSize: fontSize(11),
    fontFamily: fonts.Lato400,
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
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(64),
    paddingHorizontal: wp(14),
    borderRadius: wp(16),
    backgroundColor: colors.white,
    marginBottom: hp(24),
  },
  hostAvatar: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: colors.lightGrayF5F5F5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostAvatarIcon: {
    width: wp(22),
    height: wp(22),
    tintColor: colors.subText,
  },
  hostAvatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: wp(20),
  },
  hostName: {
    flex: 1,
    marginLeft: wp(12),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  chatIcon: {
    width: wp(36),
    height: wp(36),
  },
  locationBox: {
    height: hp(54),
    justifyContent: 'center',
    paddingHorizontal: wp(16),
    borderRadius: wp(14),
    backgroundColor: colors.white,
    marginBottom: hp(14),
  },
  locationText: {
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato500,
    fontWeight: 500
  },
  mapWrap: {
    height: hp(180),
    borderRadius: wp(16),
    overflow: 'hidden',
    marginBottom: hp(24),
  },
  map: {
    flex: 1,
  },
  bookingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(10),
  },
  bookingPill: {
    flexBasis: '22%',
    flexGrow: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(12),
    borderRadius: wp(12),
    borderWidth: 1,
    borderColor: colors.EBEBEB,
    backgroundColor: colors.white,
  },
  bookingPillSelected: {
    borderColor: colors.primary,
  },
  bookingText: {
    color: colors.darkGray,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato700,
  },
  bookingTextSelected: {
    color: colors.primary,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(24),
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
    fontSize: fontSize(12.5),
    lineHeight: fontSize(18),
    fontFamily: fonts.Lato400,
  },
  addReviewButton: {
    height: hp(54),
    borderRadius: wp(30),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: hp(20),
    marginBottom: hp(14),
  },
  addReviewText: {
    color: colors.black,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato600,
    fontWeight: 600
  },
  bookButton: {
    width: '100%',
  },
});
