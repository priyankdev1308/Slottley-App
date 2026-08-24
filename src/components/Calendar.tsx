import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const buildMonthWeeks = (year: number, month: number) => {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
};

interface CalendarProps {
  month: Date;
  onChangeMonth: (direction: 1 | -1) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  markedDates?: Date[];
  /** When set, highlights this many consecutive open days starting at
   * selectedDate (Sundays are treated as closed and skipped). */
  rangeDays?: number;
  /** When set, highlights every day from selectedDate to rangeEnd (inclusive) —
   * for a manually picked start/end range, e.g. a monthly booking. Takes
   * priority over rangeDays. */
  rangeEnd?: Date | null;
}

const Calendar = ({
  month,
  onChangeMonth,
  selectedDate,
  onSelectDate,
  markedDates = [],
  rangeDays,
  rangeEnd,
}: CalendarProps) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const weeks = buildMonthWeeks(year, monthIndex);

  const autoRangeEnd = (() => {
    if (!rangeDays) return null;
    const end = new Date(selectedDate);
    let remaining = rangeDays - 1;
    while (remaining > 0) {
      end.setDate(end.getDate() + 1);
      if (end.getDay() !== 0) remaining--;
    }
    return end;
  })();

  const isRangeMember = (day: number) => {
    const date = new Date(year, monthIndex, day);
    if (rangeEnd) {
      return date >= selectedDate && date <= rangeEnd;
    }
    if (!rangeDays || !autoRangeEnd) return false;
    if (date.getDay() === 0) return false;
    if (isSameDay(date, selectedDate)) return false;
    return date > selectedDate && date <= autoRangeEnd;
  };

  return (
    <View style={styles.card}>
      <View style={styles.monthRow}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => onChangeMonth(-1)}>
          <Image
            source={icons.arrow}
            style={[styles.chevron, styles.chevronLeft]}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {MONTH_LABELS[monthIndex]} {year}
        </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => onChangeMonth(1)}>
          <Image source={icons.arrow} style={styles.chevron} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map(label => (
          <Text key={label} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((day, dayIndex) => {
            if (!day) return <View key={dayIndex} style={styles.dayCell} />;

            const date = new Date(year, monthIndex, day);
            const isStart = isSameDay(date, selectedDate);
            const isEnd = !!rangeEnd && isSameDay(date, rangeEnd);
            const isEndpoint = isStart || isEnd;
            const isMember = isRangeMember(day);
            const isMarked = markedDates.some(d => isSameDay(d, date));

            const prevDay = week[dayIndex - 1];
            const nextDay = week[dayIndex + 1];
            const roundLeft = dayIndex === 0 || !prevDay || !isRangeMember(prevDay);
            const roundRight = dayIndex === 6 || !nextDay || !isRangeMember(nextDay);

            return (
              <TouchableOpacity
                key={dayIndex}
                activeOpacity={0.7}
                onPress={() => onSelectDate(date)}
                style={[
                  styles.dayCell,
                  isMember && styles.dayCellMember,
                  isMember && roundLeft && styles.dayCellRoundLeft,
                  isMember && roundRight && styles.dayCellRoundRight,
                ]}
              >
                <View style={[styles.dayCircle, isEndpoint && styles.dayCircleSelected]}>
                  <Text style={[styles.dayText, isEndpoint && styles.dayTextSelected]}>
                    {day}
                  </Text>
                </View>
                {isMarked && !isEndpoint && <View style={styles.markDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  card: {
    padding: wp(16),
    borderRadius: wp(20),
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(16),
  },
  chevron: {
    width: wp(16),
    height: wp(16),
    tintColor: colors.primary,
  },
  chevronLeft: {
    transform: [{ scaleX: -1 }],
  },
  monthLabel: {
    color: colors.primary,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    color: colors.primary,
    fontSize: fontSize(12.5),
    fontFamily: fonts.Lato700,
    marginBottom: hp(10),
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellMember: {
    backgroundColor: colors.lightGrayF5F5F5,
  },
  dayCellRoundLeft: {
    borderTopLeftRadius: wp(18),
    borderBottomLeftRadius: wp(18),
  },
  dayCellRoundRight: {
    borderTopRightRadius: wp(18),
    borderBottomRightRadius: wp(18),
  },
  dayCircle: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    color: colors.black,
    fontSize: fontSize(14.5),
    fontFamily: fonts.Lato400,
  },
  dayTextSelected: {
    color: colors.white,
    fontFamily: fonts.Lato700,
  },
  markDot: {
    position: 'absolute',
    bottom: hp(2),
    width: wp(5),
    height: wp(5),
    borderRadius: wp(2.5),
    backgroundColor: colors.red,
  },
});
