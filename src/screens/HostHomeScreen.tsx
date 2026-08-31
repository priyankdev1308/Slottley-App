import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../assets/icons';
import { images } from '../../assets/images';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { getGreeting } from '../helpers/globalFunctions';
import { useProfileAvatarUrl } from '../hooks/useProfileAvatarUrl';
import { MainTabScreenProps } from '../navigation/TabNav';

interface DashboardStat {
  key: string;
  icon: ImageSourcePropType;
  value: string;
  label: string;
}

const DASHBOARD_STATS: DashboardStat[] = [
  { key: 'places', icon: icons.totalPlace, value: '100', label: 'TOTAL PLACE' },
  { key: 'jobs', icon: icons.totalJobs, value: '78', label: 'TOTAL JOBS' },
  { key: 'bookings', icon: icons.totalBooking, value: '100', label: 'TOTAL BOOKING' },
  { key: 'earnings', icon: icons.totalEarning, value: '£4521', label: 'TOTAL EARNINGS' },
];

export interface MySpace {
  id: string;
  title: string;
  location: string;
  price: string;
  period: string;
  image: ImageSourcePropType;
  cqcRegistered?: boolean;
  category: string;
  categoryHint: string;
  rating: string;
  reviewCount: number;
  status: 'Active' | 'Inactive';
  description: string;
}

// TODO: replace with the signed-in host's real listings once this screen is
// wired to a backend.
export const MY_SPACES: MySpace[] = [
  {
    id: 'm1',
    title: 'Luxury Beauty Room',
    location: 'London, UK',
    price: '£45',
    period: 'day',
    image: images.dummy2,
    cqcRegistered: true,
    category: 'Hair / Rent a Chair',
    categoryHint: 'e.g. cutting, colouring, styling',
    rating: '4.8',
    reviewCount: 100,
    status: 'Active',
    description:
      'A luxurious private beauty room perfect for hairstylists, beauticians, and wellness professionals. Modern setup with premium amenities in a prime location.',
  },
  {
    id: 'm2',
    title: 'Modern Barber Chair',
    location: 'Manchester, UK',
    price: '£85',
    period: 'week',
    image: images.dummy3,
    category: 'Barber / Rent a Chair',
    categoryHint: 'e.g. fades, beard trims, shaves',
    rating: '4.6',
    reviewCount: 62,
    status: 'Active',
    description:
      'A sleek, modern barber setup in the heart of Manchester with premium chairs, mirrors, and clipper stations ready to go.',
  },
  {
    id: 'm3',
    title: 'Premium Nail Desk',
    location: 'London, UK',
    price: '£105',
    period: 'month',
    image: images.dummy1,
    category: 'Nails / Rent a Desk',
    categoryHint: 'e.g. manicure, pedicure, gel',
    rating: '4.9',
    reviewCount: 41,
    status: 'Inactive',
    description:
      'A bright, well-ventilated nail desk with UV lamps, storage, and a client seating area — ideal for nail technicians.',
  },
  {
    id: 'm4',
    title: 'Clinic Place',
    location: 'London, UK',
    price: '£55',
    period: 'day',
    category: 'Clinic / Rent a Room',
    categoryHint: 'e.g. facials, injectables, consultations',
    rating: '4.7',
    reviewCount: 28,
    status: 'Active',
    description:
      'A private, hygienic clinic room suited to aesthetics and wellness treatments, fully equipped with a treatment bed and sink.',
    image: images.dummy2,
  },
];

const HostHomeScreen = ({ navigation }: MainTabScreenProps<'Explore'>) => {
  const avatarUrl = useProfileAvatarUrl();

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
            placeholder="Type to search..."
            placeholderTextColor={colors.placeHolder}
            style={styles.searchInput}
          />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          {DASHBOARD_STATS.map(stat => (
            <View key={stat.key} style={styles.statCard}>
              <Image source={stat.icon} style={styles.statIcon} resizeMode="contain" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>My Space</Text>

        <View style={styles.spaceGrid}>
          {MY_SPACES.map(space => (
            <TouchableOpacity
              key={space.id}
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
          ))}
        </View>
      </ScrollView>

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
  spaceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(14),
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
