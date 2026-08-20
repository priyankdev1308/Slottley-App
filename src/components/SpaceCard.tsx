import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';

export interface SpaceCardData {
  id: string;
  title: string;
  location: string;
  price: string;
  period: string;
  image: ImageSourcePropType;
}

interface SpaceCardProps {
  data: SpaceCardData;
  onPress?: () => void;
  onToggleLike?: () => void;
  liked?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SpaceCard = ({ data, onPress, onToggleLike, liked, style }: SpaceCardProps) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, style]}>
    <View style={styles.imageFrame}>
      <View style={styles.imageWrap}>
        <Image source={data.image} style={styles.image} resizeMode="cover" />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggleLike}
          style={styles.likeButton}
        >
          <Image
            source={liked ? icons.like : icons.unlike}
            style={styles.likeIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.info}>
      <Text numberOfLines={1} style={styles.title}>
        {data.title}
      </Text>
      <View style={styles.locationRow}>
        <Image source={icons.mapPin} style={styles.pinIcon} resizeMode="contain" />
        <Text numberOfLines={1} style={styles.location}>
          {data.location}
        </Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{data.price}</Text>
        <Text style={styles.period}>/{data.period}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default SpaceCard;

const styles = StyleSheet.create({
  card: {
    width: wp(160),
    borderRadius: wp(8),
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageFrame: {
    padding: wp(3),
  },
  imageWrap: {
    height: hp(140),
    borderTopLeftRadius: wp(8),
    borderTopRightRadius: wp(8),
    borderBottomLeftRadius: wp(8),
    borderBottomRightRadius: wp(8),
    backgroundColor: colors.lightGrayF5F5F5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  likeButton: {
    position: 'absolute',
    top: wp(10),
    right: wp(10),
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeIcon: {
    width: wp(28),
    height: wp(28),
  },
  info: {
    padding: wp(12),
  },
  title: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(6),
  },
  pinIcon: {
    width: wp(14),
    height: wp(14),
    marginRight: wp(4),
  },
  location: {
    flex: 1,
    color: colors.subText,
    fontSize: fontSize(10),
    fontFamily: fonts.Lato400,
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
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
    marginLeft: wp(2),
  },
});
