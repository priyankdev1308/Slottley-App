import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SpaceCard, { SpaceCardData } from '../components/SpaceCard';
import { icons } from '../../assets/icons';
import { images } from '../../assets/images';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { hp, wp, fontSize } from '../helpers/responsive';
import { WishlistScreenProps } from '../interface/screenTypes';

const WISHLIST: SpaceCardData[] = [
  { id: 'w1', title: 'Luxury Beauty Room', location: 'London — Bayswater', price: '£45', period: 'day', image: images.dummy2 },
  { id: 'w2', title: 'Modern Barber Chair', location: 'London — Shoreditch', price: '£85', period: 'week', image: images.dummy3 },
  { id: 'w3', title: 'Premium Nail Desk', location: 'Manchester — Didsbury', price: '£105', period: 'month', image: images.dummy1 },
  { id: 'w4', title: 'Clinic Place', location: 'London — Bayswater', price: '£55', period: 'day', image: images.dummy2 },
  { id: 'w5', title: 'Private Aesthetic Room', location: 'London — Bayswater', price: '£60', period: 'day', image: images.dummy1 },
  { id: 'w6', title: 'Wellness Treatment Room', location: 'Nottingham — Wollaton', price: '£75', period: 'day', image: images.dummy2 },
];

const WishlistScreen = ({ navigation }: WishlistScreenProps) => {
  const [wishlist, setWishlist] = useState(WISHLIST);

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
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
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={styles.backButton} />
      </View>

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
              onToggleLike={() => removeFromWishlist(item.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WishlistScreen;

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
  scrollContent: {
    paddingHorizontal: wp(20),
    paddingTop: hp(16),
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
