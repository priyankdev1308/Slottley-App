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
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import ReadMoreText from '../components/ReadMoreText';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, screenWidth, wp } from '../helpers/responsive';
import { HostPlaceDetailScreenProps } from '../interface/screenTypes';
import { MY_SPACES } from './HostHomeScreen';

const AMENITIES = [
  { key: 'wifi', label: 'Wi-Fi', icon: icons.wifi },
  { key: 'mirror', label: 'Mirror', icon: icons.mirror },
  { key: 'music', label: 'Music System', icon: icons.music },
  { key: 'light', label: 'Natural Light', icon: icons.light },
  { key: 'fan', label: 'Fan & AC', icon: icons.fan },
];

const INCLUDED = ['Shampoo', 'Electricity', 'Use of Equipment', 'Towels', 'Tea & Coffee'];

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
    name: 'Emily Johnson',
    time: '3h',
    rating: 3,
    text: 'Great location and a professional setup. Would definitely book this space again.',
  },
];

const Stars = ({ count }: { count: number }) => (
  <View style={styles.starsRow}>
    {Array.from({ length: count }).map((_, i) => (
      <Image key={i} source={icons.star} style={styles.starIcon} resizeMode="contain" />
    ))}
  </View>
);

const HostPlaceDetailScreen = ({ navigation, route }: HostPlaceDetailScreenProps) => {
  const space = MY_SPACES.find(s => s.id === route.params?.spaceId) ?? MY_SPACES[0];

  const [activeImage, setActiveImage] = useState(0);
  const [status, setStatus] = useState(space.status);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const gallery = [space.image, space.image, space.image];

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setActiveImage(index);
  };

  const handleDelete = () => {
    Alert.alert('Delete Space', `Are you sure you want to delete "${space.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
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
            onPress={() => setStatusMenuOpen(v => !v)}
          >
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>{status}</Text>
            <Image source={icons.downArrow} style={styles.statusChevron} resizeMode="contain" />
          </TouchableOpacity>

          {statusMenuOpen && (
            <View style={styles.statusMenu}>
              {(['Active', 'Inactive'] as const).map(option => (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.8}
                  style={styles.statusMenuItem}
                  onPress={() => {
                    setStatus(option);
                    setStatusMenuOpen(false);
                  }}
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
          <View style={styles.amenitiesRow}>
            {AMENITIES.map(item => (
              <View key={item.key} style={styles.amenityItem}>
                <Image source={item.icon} style={styles.amenityIcon} resizeMode="contain" />
                <Text style={styles.amenityLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>What’s Include</Text>
          <View style={styles.includedRow}>
            {INCLUDED.map(item => (
              <View key={item} style={styles.includedChip}>
                <Image source={icons.checkGreen} style={styles.includedIcon} resizeMode="contain" />
                <Text style={styles.includedLabel}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

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
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Edit"
          onPress={() => navigation.navigate('AddNewPlaceScreen')}
          buttonStyle={styles.editButton}
          textStyle={styles.editButtonText}
        />
        <CustomButton
          title="Delete"
          onPress={handleDelete}
          buttonStyle={styles.deleteButton}
          textStyle={styles.deleteButtonText}
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
    top: hp(14),
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
    top: hp(50),
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
    justifyContent: 'space-between',
  },
  amenityItem: {
    alignItems: 'center',
    width: wp(60),
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
