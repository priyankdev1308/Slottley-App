import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';

import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { icons } from '../../assets/icons';

interface FoodCardProps {
  icon: ImageSourcePropType;
  name: string;
  weight: string;
  calories: number | string;
  protein: number;
  carbs: number;
  fats: number;
  onPress?: () => void;
}

const renderMacroStat = (label: string, value: number) => (
  <View key={label} style={styles.macroStat}>
    <Text style={styles.macroStatLabel}>{label}</Text>
    <Text style={styles.macroStatValue}>
      {value}
      <Text style={styles.macroStatUnit}>g</Text>
    </Text>
  </View>
);

const FoodCard = ({
  icon,
  name,
  weight,
  calories,
  protein,
  carbs,
  fats,
  onPress,
}: FoodCardProps) => {
  const Container = onPress ? TouchableOpacity : View;
  const isPlainIcon =
    icon === icons.mealBreakfast ||
    icon === icons.mealLunch ||
    icon === icons.mealDinner ||
    icon === icons.mealSnacks ||
    icon === icons.uploadIcon;

  return (
    <Container
      style={styles.card}
      {...(onPress ? { activeOpacity: 0.7, onPress } : {})}
    >
      <View style={styles.headerRow}>
        <View style={isPlainIcon ? styles.mealIconWrap : styles.thumbnail}>
          <Image
            source={icon}
            style={isPlainIcon ? styles.mealIcon : styles.thumbnailImage}
          />
        </View>

        <View style={styles.flex1}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.weight}>{weight}</Text>
        </View>

        <Text style={styles.calories}>
          {typeof calories === 'number' ? `${calories} Kcal` : calories}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.macroRow}>
        {renderMacroStat('Protein', protein)}
        <View style={styles.macroDivider} />
        {renderMacroStat('Carbs', carbs)}
        <View style={styles.macroDivider} />
        {renderMacroStat('Fats', fats)}
      </View>
    </Container>
  );
};

export default FoodCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: wp(14),
    borderWidth: 1,
    borderColor: colors.EBEBEB,
    backgroundColor: colors.white,
    paddingHorizontal: wp(14),
    paddingVertical: hp(12),
    marginBottom: hp(12),
  },
  flex1: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: wp(60),
    height: wp(60),
    borderRadius: wp(10),
    marginRight: wp(12),
    overflow: 'hidden',
  },
  mealIconWrap: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(12),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(12),
  },

  mealIcon: {
    width: wp(20),
    height: wp(20),
    tintColor: colors.primary,
    resizeMode: 'contain',
  },

  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    color: colors.black111827,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  weight: {
    color: colors.D2D2DE5,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400,
    marginTop: hp(2),
  },
  calories: {
    color: colors.black111827,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  divider: {
    height: 0,
    backgroundColor: colors.EBEBEB,
    marginVertical: hp(12),
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: wp(12),
    borderWidth: 1,
    borderColor: colors.EBEBEB,
    paddingVertical: hp(12),
  },
  macroStat: {
    alignItems: 'center',
    flex: 1,
  },
  macroDivider: {
    width: 1,
    backgroundColor: colors.black2,
    height: '60%',
    alignSelf: 'center',
  },
  macroStatLabel: {
    color: colors.greyText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400,
    marginBottom: hp(4),
  },
  macroStatValue: {
    color: colors.black,
    fontSize: fontSize(24),
    fontFamily: fonts.Lato700,
  },
  macroStatUnit: {
    color: colors.gray6E6E6E,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato400,
  },
});
