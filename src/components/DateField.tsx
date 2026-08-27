import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';

import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';

interface DateFieldProps {
  value: string;
  onChange: (formatted: string) => void;
  placeholder?: string;
  minimumDate?: Date;
}

const pad = (n: number) => String(n).padStart(2, '0');

const formatDate = (date: Date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

// Parses our DD/MM/YYYY display format back into a Date, falling back to
// today when the field is empty or holds something unparseable.
const parseDate = (value: string): Date => {
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return new Date();
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const DateField = ({ value, onChange, placeholder = 'Select date', minimumDate }: DateFieldProps) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [draftDate, setDraftDate] = useState(() => parseDate(value));

  const openPicker = () => {
    setDraftDate(parseDate(value));
    setPickerVisible(true);
  };

  // Android's system dialog commits immediately on selection.
  const handleAndroidChange = (_event: DateTimePickerChangeEvent, selected: Date) => {
    setPickerVisible(false);
    onChange(formatDate(selected));
  };

  // iOS uses an inline spinner inside our own modal, so selecting just
  // updates the draft — the user still has to tap Done to commit it.
  const handleIosChange = (_event: DateTimePickerChangeEvent, selected: Date) => {
    setDraftDate(selected);
  };

  const confirmIosDate = () => {
    onChange(formatDate(draftDate));
    setPickerVisible(false);
  };

  return (
    <>
      <TouchableOpacity activeOpacity={0.85} style={styles.dateInput} onPress={openPicker}>
        <Text style={[styles.dateInputText, !value && styles.dateInputPlaceholder]}>
          {value || placeholder}
        </Text>
        <Image source={icons.calendar} style={styles.calendarIcon} resizeMode="contain" />
      </TouchableOpacity>

      {pickerVisible && Platform.OS === 'android' && (
        <DateTimePicker
          value={draftDate}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          onValueChange={handleAndroidChange}
          onDismiss={() => setPickerVisible(false)}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={pickerVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setPickerVisible(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity onPress={confirmIosDate}>
                  <Text style={styles.modalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={draftDate}
                mode="date"
                display="spinner"
                minimumDate={minimumDate}
                onValueChange={handleIosChange}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default DateField;

const styles = StyleSheet.create({
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: hp(54),
    paddingHorizontal: wp(16),
    borderRadius: wp(12),
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
  },
  dateInputText: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize(14.5),
    fontFamily: fonts.Lato400,
  },
  dateInputPlaceholder: {
    color: colors.placeHolder,
  },
  calendarIcon: {
    width: wp(20),
    height: wp(20),
    tintColor: colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: wp(20),
    borderTopRightRadius: wp(20),
    paddingHorizontal: wp(20),
    paddingTop: hp(14),
    paddingBottom: hp(24),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(6),
  },
  modalTitle: {
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato600,
  },
  modalCancel: {
    color: colors.subText,
    fontSize: fontSize(14.5),
    fontFamily: fonts.Lato500,
  },
  modalDone: {
    color: colors.primary,
    fontSize: fontSize(14.5),
    fontFamily: fonts.Lato700,
  },
  iosPicker: {
    alignSelf: 'center',
  },
});
