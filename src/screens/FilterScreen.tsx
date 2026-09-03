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
import DateField, { formatDate } from '../components/DateField';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { FilterScreenProps } from '../interface/screenTypes';

// Parses our DD/MM/YYYY display format back into a Date, falling back to
// today when the field is empty or holds something unparseable.
const parseDMY = (ddmmyyyy: string): Date => {
  const match = ddmmyyyy.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return new Date();
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const MIN_AVAILABILITY_GAP_DAYS = 30;

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
const PRICE_MAX = 1000;

const DEFAULT_PRICE_RANGE: [number, number] = [100, 580];
const DEFAULT_CATEGORY = 'aesthetics';
const DEFAULT_DURATION = 'Weekly';

const FilterScreen = ({ navigation }: FilterScreenProps) => {
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [postCode, setPostCode] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [cqcOnly, setCqcOnly] = useState(true);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [startDate, setStartDate] = useState(() => formatDate(new Date()));
  const [endDate, setEndDate] = useState(() =>
    formatDate(addDays(new Date(), MIN_AVAILABILITY_GAP_DAYS)),
  );

  // Keeps the End Date pinned at least 30 days after the Start Date whenever
  // the Start Date moves — the DateField's own minimumDate only stops new
  // picks, it can't retroactively fix a value that's now too close.
  const handleStartDateChange = (formatted: string) => {
    setStartDate(formatted);

    const newStart = parseDMY(formatted);
    const newMinEnd = addDays(newStart, MIN_AVAILABILITY_GAP_DAYS);
    if (parseDMY(endDate) < newMinEnd) {
      setEndDate(formatDate(newMinEnd));
    }
  };

  const handleClear = () => {
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setPostCode('');
    setCategory('all');
    setCqcOnly(false);
    setDuration(DEFAULT_DURATION);
    setStartDate(formatDate(new Date()));
    setEndDate(formatDate(addDays(new Date(), MIN_AVAILABILITY_GAP_DAYS)));
  };

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
                    <View
                      style={[
                        styles.categoryRow,
                        item.key === 'all' && styles.categoryRowCentered,
                      ]}
                    >
                      <View
                        style={[
                          styles.categoryTextCol,
                          item.key === 'all' && styles.categoryTextColCentered,
                        ]}
                      >
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
            <DateField
              value={startDate}
              onChange={handleStartDateChange}
              placeholder="Select start date"
              minimumDate={new Date()}
            />
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>End Date</Text>
            <DateField
              value={endDate}
              onChange={setEndDate}
              placeholder="Select end date"
              minimumDate={addDays(parseDMY(startDate), MIN_AVAILABILITY_GAP_DAYS)}
            />
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
  categoryRowCentered: {
    flex: 1,
    alignItems: 'center',
  },
  categoryTextColCentered: {
    alignItems: 'center',
  },
  categoryTextCol: {
    flex: 1,
    paddingRight: wp(8),
  },
  categoryTitle: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
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
    fontFamily: fonts.Lato500,
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
