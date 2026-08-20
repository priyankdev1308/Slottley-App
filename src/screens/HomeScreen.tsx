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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SpaceCard, { SpaceCardData } from '../components/SpaceCard';
import { icons } from '../../assets/icons';
import { images } from '../../assets/images';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { MainTabScreenProps } from '../navigation/TabNav';

// Mock data standing in for the "Space Near You" / "Featured spaces" API
// responses — real listings will bring their own photo per item.
const NEAR_YOU: SpaceCardData[] = [
  { id: 'n1', title: 'Premium Nail Desk', location: 'Manchester — Didsbury', price: '£105', period: 'month', image: images.dummy1 },
  { id: 'n2', title: 'Luxury Beauty Room', location: 'Nottingham — Wollaton', price: '£15', period: 'hour', image: images.dummy2 },
  { id: 'n3', title: 'Modern Barbershop', location: 'London — Shoreditch', price: '£65', period: 'week', image: images.dummy3 },
];

const FEATURED: SpaceCardData[] = [
  { id: 'f1', title: 'Clinic Place', location: 'London — Shoreditch', price: '£55', period: 'week', image: images.dummy2 },
  { id: 'f2', title: 'Premium Hair Spa', location: 'Manchester — Didsbury', price: '£105', period: 'month', image: images.dummy3 },
  { id: 'f3', title: 'Modern Salon', location: 'Nottingham — Wollaton', price: '£25', period: 'hour', image: images.dummy1 },
];

const HomeScreen = ({ navigation }: MainTabScreenProps<'Explore'>) => {
  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerTop}>
          <View style={styles.avatar}>
            <Image
              source={icons.tabProfile}
              style={styles.avatarIcon}
              resizeMode="contain"
            />
          </View>

          <View style={styles.greetingCol}>
            <Text style={styles.greeting}>Hello Good Morning</Text>
            <Text style={styles.heading}>Find a Space That Works For You</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.bellButton}>
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
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Space Near You</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardRow}
        >
          {NEAR_YOU.map(item => (
            <SpaceCard
              key={item.id}
              data={item}
              onPress={() => navigation.navigate('PlaceDetailScreen', { spaceId: item.id })}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured spaces</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardRow}
        >
          {FEATURED.map(item => (
            <SpaceCard
              key={item.id}
              data={item}
              onPress={() => navigation.navigate('PlaceDetailScreen', { spaceId: item.id })}
            />
          ))}
        </ScrollView>
      </ScrollView>
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
  greetingCol: {
    flex: 1,
    marginLeft: wp(12),
  },
  greeting: {
    color: colors.white50,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato400,
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
});
