import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Circle } from 'react-native-maps';

import CustomButton from '../components/CustomButton';
import ReadMoreText from '../components/ReadMoreText';
import { icons } from '../../assets/icons';
import { images } from '../../assets/images';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, screenWidth, wp } from '../helpers/responsive';
import { PlaceDetailScreenProps } from '../interface/screenTypes';

// Mock data standing in for the listing/host/review API responses.
const GALLERY = [images.dummy2, images.dummy1, images.dummy3];

const AMENITIES = [
  { key: 'wifi', label: 'Wi-Fi', icon: icons.wifi },
  { key: 'mirror', label: 'Mirror', icon: icons.mirror },
  { key: 'music', label: 'Music System', icon: icons.music },
  { key: 'light', label: 'Natural Light', icon: icons.light },
  { key: 'fan', label: 'Fan & AC', icon: icons.fan },
];

const INCLUDED = ['Shampoo', 'Electricity', 'Use of Equipment', 'Towels', 'Tea & Coffee'];

const BOOKING_OPTIONS = ['Hourly', 'Daily', 'Weekly', 'Monthly'];

const REVIEWS = [
  {
    id: 'r1',
    name: 'David Joseph',
    time: '3h',
    rating: 4,
    text: 'Lovely space with everything I needed. The room was clean, comfortable and well equipped.',
  },
  {
    id: 'r2',
    name: 'Emily Jhonson',
    time: '3h',
    rating: 3,
    text: 'Great location and a professional setup. Would definitely book this space again.',
  },
];

// Bayswater, London — stand-in coordinates for the mock "London- Bayswater" address.
const LOCATION = { latitude: 51.5142, longitude: -0.1879 };

const Stars = ({ count }: { count: number }) => (
  <View style={styles.starsRow}>
    {Array.from({ length: count }).map((_, i) => (
      <Image key={i} source={icons.star} style={styles.starIcon} resizeMode="contain" />
    ))}
  </View>
);

const PlaceDetailScreen = ({ navigation }: PlaceDetailScreenProps) => {
  const [liked, setLiked] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingFor, setBookingFor] = useState('Hourly');

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setActiveImage(index);
  };

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
        <TouchableOpacity activeOpacity={0.8} onPress={() => setLiked(v => !v)}>
          <Image
            source={icons.likeBlack}
            style={[styles.likeIcon, liked && { tintColor: colors.red }]}
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
          {GALLERY.map((image, index) => (
            <Image key={index} source={image} style={styles.galleryImage} resizeMode="cover" />
          ))}
        </ScrollView>
        <View style={styles.dotsRow}>
          {GALLERY.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeImage && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Luxury Beauty Room</Text>
            <Text style={styles.price}>
              £45/ <Text style={styles.pricePeriod}>day</Text>
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Image source={icons.mapPin} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.metaText}>London — Shoreditch</Text>
            </View>
            <View style={styles.metaItem}>
              <Image source={icons.star} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.metaText}>4.8 (100 reviews)</Text>
            </View>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Instant Booking Available</Text>
          </View>

          <View style={styles.cqcNotice}>
            <Text style={styles.cqcNoticeTitle}>ⓘ CQC Registered ✓</Text>
            <Text style={styles.cqcNoticeText}>
              CQC registration status is self-declared by the host and verified by Slottley
              against the public register where indicated. Absence of this badge does not imply
              non-compliance. Practitioners are responsible for confirming a space meets
              requirements for their specific treatments.
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>About This Space</Text>
          <ReadMoreText
            text="A luxurious private beauty room perfect for hairstylists, beauticians, and wellness professionals. Modern setup with premium amenities in a prime location.
            Known for resolving specific hair issues like frizzy hair treatments and precise hair cutting.Highly praised stylists include Akash, Dharsan Bhai, Ganesh, and Dishang.Offers an premium environment for men, women, and children."
            numberOfLines={3}
            style={styles.aboutText}
            linkStyle={styles.readMore}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Amenities</Text>
          <View style={styles.amenitiesRow}>
            {AMENITIES.map(item => (
              <View key={item.key} style={styles.amenityItem}>
                <Image source={item.icon} style={styles.amenityIcon} resizeMode="contain" />
                <Text style={styles.amenityLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>What's Include</Text>
          <View style={styles.includedRow}>
            {INCLUDED.map(item => (
              <View key={item} style={styles.includedChip}>
                <Image source={icons.checkGreen} style={styles.includedIcon} resizeMode="contain" />
                <Text style={styles.includedLabel}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Host</Text>
          <View style={styles.hostRow}>
            <View style={styles.hostAvatar}>
              <Image
                source={icons.tabProfile}
                style={styles.hostAvatarIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.hostName}>kenzi lawson</Text>
            <TouchableOpacity activeOpacity={0.8}>
              <Image source={icons.chat} style={styles.chatIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Location</Text>
          <View style={styles.locationBox}>
            <Text style={styles.locationText}>London- Bayswater</Text>
          </View>
          <View style={styles.mapWrap}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: LOCATION.latitude,
                longitude: LOCATION.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Circle
                center={LOCATION}
                radius={300}
                strokeColor={colors.primary}
                strokeWidth={2}
                fillColor="rgba(21,53,41,0.15)"
              />
            </MapView>
          </View>

          <Text style={styles.sectionLabel}>Booking For</Text>
          <View style={styles.bookingRow}>
            {BOOKING_OPTIONS.map(option => {
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

          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionLabel}>Reviews</Text>
            <TouchableOpacity activeOpacity={0.8} style={styles.viewAllRow}>
              <Text style={styles.viewAll}>View All</Text>
              <Image source={icons.arrow} style={styles.viewAllArrow} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          {REVIEWS.map((review, index) => (
            <View key={review.id}>
              <View style={styles.reviewRow}>
                <View style={styles.reviewAvatar}>
                  <Image
                    source={icons.tabProfile}
                    style={styles.reviewAvatarIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.reviewTextCol}>
                  <View style={styles.reviewNameRow}>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <Text style={styles.reviewTime}>{review.time}</Text>
                  </View>
                  <Stars count={review.rating} />
                  <Text style={styles.reviewText}>{review.text}</Text>
                </View>
              </View>
              {index < REVIEWS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}

          <TouchableOpacity activeOpacity={0.85} style={styles.addReviewButton}>
            <Text style={styles.addReviewText}>Add Review</Text>
          </TouchableOpacity>

          <CustomButton
            title="Book Instantly"
            onPress={() =>
              navigation.navigate('BookPlaceScreen', {
                mode: bookingFor === 'Weekly' || bookingFor === 'Monthly' ? 'weekly' : 'single',
              })
            }
            buttonStyle={styles.bookButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlaceDetailScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(20),
    paddingVertical: hp(14),
  },
  backButton: {
    width: wp(32),
    height: wp(32),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backIcon: {
    width: wp(22),
    height: wp(22),
    tintColor: colors.primary,
  },
  headerTitle: {
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
    fontWeight: 600
  },
  likeIcon: {
    width: wp(36),
    height: wp(36),
  },
  galleryImage: {
    width: screenWidth,
    height: hp(230),
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
