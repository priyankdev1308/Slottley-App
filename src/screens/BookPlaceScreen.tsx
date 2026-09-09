import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Calendar from '../components/Calendar';
import CustomButton from '../components/CustomButton';
import ToastAlert from '../components/ToastAlert';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { BookPlaceScreenProps } from '../interface/screenTypes';
import { BookingDraft } from '../interface/common';
import { supabase } from '../api/supabaseClient';
import { MySpace, fetchPlaceById } from '../api/places';

type Mode = 'hourly' | 'daily' | 'weekly' | 'monthly';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

const HOUR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const hours = i + 1;
  return `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
});

const DAY_OPTIONS = Array.from({ length: 30 }, (_, i) => {
  const days = i + 1;
  return `${days} ${days === 1 ? 'Day' : 'Days'}`;
});

const MODE_LABEL: Record<Mode, 'Hourly' | 'Daily' | 'Weekly' | 'Monthly'> = {
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const MODE_UNIT: Record<Mode, string> = {
  hourly: 'hour',
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
};

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const formatDate = (date: Date) =>
  `${date.getDate()} ${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;

const parseLeadingNumber = (text: string): number => parseInt(text, 10) || 1;

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const atMidnight = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const withTime = (date: Date, hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const next = new Date(date);
  next.setHours(h, m, 0, 0);
  return next;
};

const formatTime = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

// Calendar-day difference, ignoring time-of-day.
const diffInCalendarDays = (a: Date, b: Date) => {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / 86400000);
};

interface PickerFieldProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  icon?: any;
}

const PickerField = ({ label, value, options, onSelect, icon }: PickerFieldProps) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.fieldBox}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.fieldValue}>{value}</Text>
        {icon && (
          <View style={styles.fieldIconBadge}>
            <Image source={icon} style={styles.fieldIcon} resizeMode="contain" />
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{label}</Text>
                <ScrollView style={styles.modalList}>
                  {options.map(option => (
                    <TouchableOpacity
                      key={option}
                      activeOpacity={0.8}
                      style={styles.modalOption}
                      onPress={() => {
                        onSelect(option);
                        setOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          option === value && styles.modalOptionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const RATE_KEY: Record<Mode, keyof MySpace> = {
  hourly: 'hourlyPrice',
  daily: 'dailyPrice',
  weekly: 'weeklyPrice',
  monthly: 'monthlyPrice',
};

const ENABLED_KEY: Record<Mode, keyof MySpace> = {
  hourly: 'hourlyEnabled',
  daily: 'dailyEnabled',
  weekly: 'weeklyEnabled',
  monthly: 'monthlyEnabled',
};

const BookPlaceScreen = ({ navigation, route }: BookPlaceScreenProps) => {
  const { mode, spaceId } = route.params;

  const [space, setSpace] = useState<MySpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState(TIME_SLOTS[2]);
  const [hours, setHours] = useState(HOUR_OPTIONS[1]);
  const [days, setDays] = useState(DAY_OPTIONS[0]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchPlaceById(spaceId);
      if (!cancelled) {
        setSpace(result);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [spaceId]);

  const onChangeMonth = (direction: 1 | -1) => {
    setMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const handleSelectDate = (date: Date) => {
    if (mode !== 'monthly') {
      setSelectedDate(date);
      return;
    }
    if (endDate) {
      // A range is already set — start a fresh selection from here.
      setSelectedDate(date);
      setEndDate(null);
    } else if (date <= selectedDate) {
      setSelectedDate(date);
    } else {
      setEndDate(date);
    }
  };

  const rate = (space?.[RATE_KEY[mode]] as number | null) ?? null;
  const enabled = !!space?.[ENABLED_KEY[mode]];
  const available = enabled && !!rate;

  const hoursCount = parseLeadingNumber(hours);
  const daysCount = parseLeadingNumber(days);

  // Per-mode derived quantity, computed end date/time, and display strings —
  // all four share the same two persisted columns (start/end date-time),
  // just filled in differently.
  let quantity = 0;
  let startDateTime: Date = selectedDate;
  let endDateTime: Date | null = null;
  let endDisplay = '';

  if (mode === 'hourly') {
    quantity = hoursCount;
    startDateTime = withTime(selectedDate, startTime);
    endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + hoursCount * 60);
    endDisplay = formatTime(endDateTime);
  } else if (mode === 'daily') {
    quantity = daysCount;
    startDateTime = atMidnight(selectedDate);
    endDateTime = atMidnight(addDays(selectedDate, daysCount - 1));
    endDisplay = formatDate(endDateTime);
  } else if (mode === 'weekly') {
    quantity = 1;
    startDateTime = atMidnight(selectedDate);
    endDateTime = atMidnight(addDays(selectedDate, 6));
    endDisplay = formatDate(endDateTime);
  } else {
    startDateTime = atMidnight(selectedDate);
    if (endDate) {
      endDateTime = atMidnight(endDate);
      const totalDays = Math.max(1, diffInCalendarDays(selectedDate, endDate) + 1);
      quantity = Math.max(1, Math.ceil(totalDays / 30));
      endDisplay = `${formatDate(endDate)} (${quantity} ${quantity === 1 ? 'month' : 'months'})`;
    } else {
      endDisplay = 'Tap an end date';
    }
  }

  const total = rate ? rate * quantity : 0;
  const canBook = available && !!endDateTime && quantity > 0;

  const handleBookPlace = async () => {
    if (!space || !endDateTime || !rate) {
      ToastAlert({
        title: mode === 'monthly' ? 'Select an end date' : 'Pricing unavailable',
        description:
          mode === 'monthly'
            ? 'Tap an end date on the calendar to continue.'
            : 'This space has no rate set for this booking type.',
      });
      return;
    }

    setSubmitting(true);
    const { data: authData } = await supabase.auth.getUser();
    setSubmitting(false);
    if (!authData.user) {
      ToastAlert({ title: 'Please sign in', description: 'You need to be signed in to book a space.' });
      return;
    }

    // No book_space row is created here anymore — it's only inserted by the
    // create-booking-payment Edge Function after a real Stripe charge
    // succeeds, so nothing is persisted until payment goes through.
    const draft: BookingDraft = {
      placeId: space.id,
      placeTitle: space.title,
      placeLocation: space.location,
      placeImage: space.image,
      bookingType: MODE_LABEL[mode],
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      quantity,
      rate,
      totalPrice: total,
    };

    navigation.navigate('RentAgreementScreen', { draft });
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
        <Text style={styles.headerTitle}>Booking</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {space && (
          <View style={styles.summaryCard}>
            <Text numberOfLines={1} style={styles.summaryTitle}>{space.title}</Text>
            <Text numberOfLines={1} style={styles.summaryLocation}>{space.location}</Text>
            <Text style={styles.summaryRate}>
              {rate != null ? `£${rate}` : '£0'} <Text style={styles.summaryRateUnit}>/ {MODE_UNIT[mode]}</Text>
            </Text>
          </View>
        )}

        {!available && (
          <Text style={styles.emptyText}>
            This space doesn't have a {MODE_LABEL[mode].toLowerCase()} rate set up.
          </Text>
        )}

        <Calendar
          month={month}
          onChangeMonth={onChangeMonth}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          rangeDays={mode === 'daily' ? daysCount : mode === 'weekly' ? 7 : undefined}
          rangeEnd={mode === 'monthly' ? endDate : undefined}
        />

        {mode === 'monthly' && (
          <View style={styles.dateRangeRow}>
            <View style={styles.dateRangeField}>
              <Text style={styles.fieldLabel}>Start Date</Text>
              <View style={styles.fieldBox}>
                <Text style={styles.fieldValue}>{formatDate(selectedDate)}</Text>
              </View>
            </View>
            <View style={styles.dateRangeField}>
              <Text style={styles.fieldLabel}>End Date</Text>
              <View style={styles.fieldBox}>
                <Text style={styles.fieldValue}>{endDisplay}</Text>
              </View>
            </View>
          </View>
        )}

        {mode === 'hourly' && (
          <>
            <PickerField
              label="Start Time"
              value={startTime}
              options={TIME_SLOTS}
              onSelect={setStartTime}
              icon={icons.clock}
            />
            <PickerField
              label="Hours"
              value={hours}
              options={HOUR_OPTIONS}
              onSelect={setHours}
            />
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>End Time</Text>
              <View style={styles.fieldBox}>
                <Text style={styles.fieldValue}>{endDisplay}</Text>
              </View>
            </View>
          </>
        )}

        {mode === 'daily' && (
          <>
            <PickerField
              label="Number of Days"
              value={days}
              options={DAY_OPTIONS}
              onSelect={setDays}
            />
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>End Date</Text>
              <View style={styles.fieldBox}>
                <Text style={styles.fieldValue}>{endDisplay}</Text>
              </View>
            </View>
          </>
        )}

        {mode === 'weekly' && (
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>End Date</Text>
            <View style={styles.fieldBox}>
              <Text style={styles.fieldValue}>{endDisplay}</Text>
            </View>
          </View>
        )}

        {canBook && (
          <View style={styles.priceSummary}>
            <View style={styles.priceSummaryRow}>
              <Text style={styles.priceSummaryLabel}>
                £{rate} x {quantity} {quantity === 1 ? MODE_UNIT[mode] : `${MODE_UNIT[mode]}s`}
              </Text>
              <Text style={styles.priceSummaryTotal}>£{total}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Book Place"
          onPress={handleBookPlace}
          loader={submitting}
          disable={submitting || !canBook}
        />
      </View>
    </SafeAreaView>
  );
};

export default BookPlaceScreen;

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
  scrollContent: {
    paddingHorizontal: wp(20),
    paddingBottom: hp(20),
    paddingTop: hp(20)
  },
  summaryCard: {
    marginBottom: hp(16),
    padding: wp(16),
    borderRadius: wp(16),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.EBEBEB,
  },
  summaryTitle: {
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  summaryLocation: {
    marginTop: hp(4),
    color: colors.subText,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato400,
  },
  summaryRate: {
    marginTop: hp(8),
    color: colors.primary,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato700,
  },
  summaryRateUnit: {
    color: colors.primary,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato500,
  },
  emptyText: {
    marginBottom: hp(16),
    color: colors.subText,
    fontSize: fontSize(13.5),
    fontFamily: fonts.Lato400,
  },
  fieldWrap: {
    marginTop: hp(20),
  },
  dateRangeRow: {
    flexDirection: 'row',
    gap: wp(14),
    marginTop: hp(20),
  },
  dateRangeField: {
    flex: 1,
  },
  fieldLabel: {
    marginBottom: hp(10),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato600,
    fontWeight: 600
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: hp(56),
    paddingHorizontal: wp(16),
    borderRadius: wp(14),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.EBEBEB,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  fieldValue: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
    fontWeight: 500
  },
  fieldIconBadge: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    backgroundColor: 'clear',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldIcon: {
    width: wp(24),
    height: wp(24),
  },
  priceSummary: {
    marginTop: hp(24),
    padding: wp(16),
    borderRadius: wp(16),
    backgroundColor: colors.primaryLight,
  },
  priceSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceSummaryLabel: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  priceSummaryTotal: {
    color: colors.primary,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato700,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black3,
    paddingHorizontal: wp(40),
  },
  modalCard: {
    width: '100%',
    maxHeight: hp(360),
    borderRadius: wp(18),
    backgroundColor: colors.white,
    paddingVertical: hp(10),
  },
  modalTitle: {
    paddingHorizontal: wp(18),
    paddingVertical: hp(10),
    color: colors.black,
    fontSize: fontSize(15),
    fontFamily: fonts.Lato700,
  },
  modalList: {
    paddingHorizontal: wp(6),
  },
  modalOption: {
    paddingVertical: hp(12),
    paddingHorizontal: wp(12),
  },
  modalOptionText: {
    color: colors.darkGray,
    fontSize: fontSize(14.5),
    fontFamily: fonts.Lato400,
  },
  modalOptionTextSelected: {
    color: colors.primary,
    fontFamily: fonts.Lato700,
  },
  footer: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(16),
  },
});
