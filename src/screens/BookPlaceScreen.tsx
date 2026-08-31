import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Calendar from '../components/Calendar';
import CustomButton from '../components/CustomButton';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { BookPlaceScreenProps } from '../interface/screenTypes';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

const HOUR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const hours = i + 1;
  return `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
});

// Mock — dates the host has already marked as booked elsewhere on the calendar.
const today = new Date();
const MARKED_DATES = [6, 10, 23].map(day => new Date(today.getFullYear(), today.getMonth(), day));

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const formatDate = (date: Date) =>
  `${date.getDate()} ${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;

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

const BookPlaceScreen = ({ navigation, route }: BookPlaceScreenProps) => {
  const { mode } = route.params;
  const isWeekly = mode === 'weekly';
  const isMonthly = mode === 'monthly';

  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState(TIME_SLOTS[2]);
  const [hours, setHours] = useState(HOUR_OPTIONS[1]);

  const onChangeMonth = (direction: 1 | -1) => {
    setMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const handleSelectDate = (date: Date) => {
    if (!isMonthly) {
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
        <Calendar
          month={month}
          onChangeMonth={onChangeMonth}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          markedDates={MARKED_DATES}
          rangeDays={isWeekly ? 7 : undefined}
          rangeEnd={isMonthly ? endDate : undefined}
        />

        {isMonthly && (
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
                <Text style={styles.fieldValue}>
                  {endDate ? formatDate(endDate) : 'Tap an end date'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {mode === 'single' && (
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
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Book Place"
          onPress={() => navigation.navigate('RentAgreementScreen')}
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
