import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RangeSlider from '../components/RangeSlider';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { FilterScreenProps } from '../interface/screenTypes';

interface SpaceCategory {
  key: string;
  title: string;
  description?: string;
  fullWidth?: boolean;
}

const CATEGORIES: SpaceCategory[] = [
  { key: 'all', title: 'All categories' },
  {
    key: 'hair',
    title: 'Hair / Rent a Chair',
    description: 'e.g. cutting, colouring, styling',
  },
  {
    key: 'beauty',
    title: 'Beauty Room',
    description: 'e.g. facials, waxing, tinting, makeup, brow & lash',
  },
  {
    key: 'barber',
    title: 'Barber Chair',
    description: "e.g. men's cuts, shaves, grooming",
  },
  {
    key: 'nail',
    title: 'Nail Station',
    description: 'e.g. manicure, pedicure, nail extensions',
    fullWidth: true,
  },
  {
    key: 'therapy',
    title: 'Therapy Room',
    description: 'e.g. massage, reflexology, holistic & complementary therapies',
    fullWidth: true,
  },
  {
    key: 'aesthetics',
    title: 'Aesthetics Room',
    description: 'e.g. Botox, fillers, chemical peels, skin treatments',
    fullWidth: true,
  },
];

// Pairs up the narrow cards two-per-row (each row stretches both cards to
// the taller one's height) and keeps full-width cards on their own row.
const CATEGORY_ROWS: SpaceCategory[][] = (() => {
  const rows: SpaceCategory[][] = [];
  let pair: SpaceCategory[] = [];
  CATEGORIES.forEach(item => {
    if (item.fullWidth) {
      if (pair.length) {
        rows.push(pair);
        pair = [];
      }
      rows.push([item]);
    } else {
      pair.push(item);
      if (pair.length === 2) {
        rows.push(pair);
        pair = [];
      }
    }
  });
  if (pair.length) rows.push(pair);
  return rows;
})();

const DURATIONS = ['Hourly', 'Daily', 'Weekly', 'Monthly'];

const PRICE_MIN = 0;
const PRICE_MAX = 100;

const DEFAULT_PRICE_RANGE: [number, number] = [12, 85];
const DEFAULT_CATEGORY = 'aesthetics';
const DEFAULT_DURATION = 'Weekly';
const DEFAULT_START_DATE = '15/12/2026';
const DEFAULT_END_DATE = '21/12/2026';

const FilterScreen = ({ navigation }: FilterScreenProps) => {
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [postCode, setPostCode] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [cqcOnly, setCqcOnly] = useState(true);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [startDate] = useState(DEFAULT_START_DATE);
  const [endDate] = useState(DEFAULT_END_DATE);

  const handleClear = () => {
    setPriceRange(DEFAULT_PRICE_RANGE);
    setPostCode('');
    setCategory('all');
    setCqcOnly(false);
    setDuration(DEFAULT_DURATION);
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
        <Text style={styles.headerTitle}>Filter</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Price Range</Text>
        <RangeSlider
          min={PRICE_MIN}
          max={PRICE_MAX}
          value={priceRange}
          onChange={setPriceRange}
        />
        <View style={styles.priceLabelRow}>
          <Text style={styles.priceLabel}>£{priceRange[0]}</Text>
          <Text style={styles.priceLabel}>£{priceRange[1]}</Text>
        </View>

        <Text style={styles.sectionLabel}>Location</Text>
        <View style={styles.locationRow}>
          <TextInput
            value={postCode}
            onChangeText={setPostCode}
            placeholder="Post Code"
            placeholderTextColor={colors.placeHolder}
            style={styles.locationInput}
          />
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.useLocation}>Use Current Location</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Types Of Space</Text>
        <View style={styles.categoryGrid}>
          {CATEGORY_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.categoryRowWrap}>
              {row.map(item => {
                const isSelected = category === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.85}
                    onPress={() => setCategory(item.key)}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardSelected,
                    ]}
                  >
                    <View style={styles.categoryRow}>
                      <View style={styles.categoryTextCol}>
                        <Text style={styles.categoryTitle}>{item.title}</Text>
                        {!!item.description && (
                          <Text style={styles.categoryDescription}>{item.description}</Text>
                        )}
                      </View>
                      <Image
                        source={isSelected ? icons.checkCircle : icons.circle}
                        style={styles.radioIcon}
                        resizeMode="contain"
                      />
                    </View>

                    {item.key === 'aesthetics' && isSelected && (
                      <>
                        <View style={styles.cardDivider} />
                        <View style={styles.cqcRow}>
                          <Text style={styles.cqcText}>CQC Registered only</Text>
                          <Switch
                            value={cqcOnly}
                            onValueChange={setCqcOnly}
                            trackColor={{ false: colors.EBEBEB, true: colors.primary }}
                            thumbColor={colors.white}
                          />
                        </View>
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>How Long You Want</Text>
        <View style={styles.durationGrid}>
          {DURATIONS.map(item => {
            const isSelected = duration === item;
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.85}
                onPress={() => setDuration(item)}
                style={[styles.durationPill, isSelected && styles.durationPillSelected]}
              >
                <Text style={styles.durationText}>{item}</Text>
                <Image
                  source={isSelected ? icons.checkCircle : icons.circle}
                  style={styles.radioIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Availability</Text>
        <View style={styles.dateRow}>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <TouchableOpacity activeOpacity={0.8} style={styles.dateInput}>
              <Text style={styles.dateValue}>{startDate}</Text>
              <Image source={icons.calendar} style={styles.calendarIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>End Date</Text>
            <TouchableOpacity activeOpacity={0.8} style={styles.dateInput}>
              <Text style={styles.dateValue}>{endDate}</Text>
              <Image source={icons.calendar} style={styles.calendarIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85} style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.applyButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FilterScreen;

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
    fontSize: fontSize(19),
    fontFamily: fonts.Lato700,
  },
  scrollContent: {
    paddingHorizontal: wp(20),
    paddingBottom: hp(24),
  },
  sectionLabel: {
    marginTop: hp(24),
    marginBottom: hp(14),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  priceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(12),
  },
  priceLabel: {
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: hp(54),
    paddingHorizontal: wp(16),
    borderRadius: wp(14),
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.textPlaceHolderColor,
  },
  locationInput: {
    flex: 1,
    padding: 0,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  useLocation: {
    color: colors.primary,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato700,
  },
  categoryGrid: {
    gap: wp(10),
  },
  categoryRowWrap: {
    flexDirection: 'row',
    gap: wp(10),
  },
  categoryCard: {
    flex: 1,
    borderRadius: wp(14),
    padding: wp(14),
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.textPlaceHolderColor,
  },
  categoryCardSelected: {
    backgroundColor: colors.sage,
    borderColor: colors.primary,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  categoryTextCol: {
    flex: 1,
    paddingRight: wp(8),
  },
  categoryTitle: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  categoryDescription: {
    marginTop: hp(4),
    color: colors.darkGray,
    fontSize: fontSize(11),
    fontFamily: fonts.Lato400,
  },
  radioIcon: {
    width: wp(22),
    height: wp(22),
  },
  cardDivider: {
    height: 1,
    marginVertical: hp(12),
    backgroundColor: colors.primaryLight,
  },
  cqcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cqcText: {
    color: colors.black,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato400,
    fontStyle: 'italic',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(10),
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexBasis: '31%',
    flexGrow: 0,
    paddingVertical: hp(12),
    paddingHorizontal: wp(12),
    borderRadius: wp(14),
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.textPlaceHolderColor,
  },
  durationPillSelected: {
    backgroundColor: colors.sage,
    borderColor: colors.primary,
  },
  durationText: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  dateRow: {
    flexDirection: 'row',
    gap: wp(12),
  },
  dateCol: {
    flex: 1,
  },
  dateLabel: {
    marginBottom: hp(8),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: hp(52),
    paddingHorizontal: wp(14),
    borderRadius: wp(14),
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.textPlaceHolderColor,
  },
  dateValue: {
    color: colors.darkGray,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  calendarIcon: {
    width: wp(18),
    height: wp(18),
  },
  footer: {
    flexDirection: 'row',
    gap: wp(12),
    paddingHorizontal: wp(20),
    paddingTop: hp(12),
    paddingBottom: hp(16),
  },
  clearButton: {
    flex: 1,
    height: hp(56),
    borderRadius: wp(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  clearText: {
    color: colors.primary,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  applyButton: {
    flex: 1,
    height: hp(56),
    borderRadius: wp(30),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  applyText: {
    color: colors.white,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
});
