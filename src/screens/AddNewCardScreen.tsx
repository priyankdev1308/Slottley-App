import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import ToastAlert from '../components/ToastAlert';
import { MastercardIcon, CloseIcon } from '../components/icons/CardIcons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp, isIos } from '../helpers/responsive';
import { AddNewCardScreenProps } from '../interface/screenTypes';
import { SavedCard } from '../interface/common';

const formatCardNumber = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const detectBrand = (digits: string): SavedCard['brand'] | null => {
  if (!digits) return null;
  if (digits.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(digits)) return 'mastercard';
  return null;
};

const AddNewCardScreen = ({ navigation, route }: AddNewCardScreenProps) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');

  const digits = cardNumber.replace(/\D/g, '');
  const brand = detectBrand(digits);

  const handleClose = () => navigation.goBack();

  const handleAdd = () => {
    if (digits.length < 16) {
      ToastAlert({ title: 'Invalid card number', description: 'Enter all 16 digits.' });
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      ToastAlert({ title: 'Invalid expiry date', description: 'Use the format MM/YY.' });
      return;
    }
    if (cvv.length < 3) {
      ToastAlert({ title: 'Invalid CVV', description: 'Enter a valid CVV.' });
      return;
    }
    if (!cardHolderName.trim()) {
      ToastAlert({ title: 'Card holder name required', description: 'Please enter the name on the card.' });
      return;
    }

    route.params.onAdd({
      id: Date.now().toString(),
      brand: brand ?? 'visa',
      first4: digits.slice(0, 4),
      last4: digits.slice(-4),
    });
    navigation.goBack();
  };

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={isIos ? 'padding' : undefined}
        style={styles.sheetWrap}
      >
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.closeButton} />
            <Text style={styles.headerTitle}>Add New Card</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={handleClose} style={styles.closeButton}>
              <CloseIcon size={14} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Enter Card Number</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={cardNumber}
                onChangeText={text => setCardNumber(formatCardNumber(text))}
                placeholder="XXXX XXXX XXXX XXXX"
                placeholderTextColor={colors.placeHolder}
                keyboardType="number-pad"
                style={styles.input}
              />
              {brand === 'mastercard' && <MastercardIcon size={26} />}
              {brand === 'visa' && <Text style={styles.visaText}>VISA</Text>}
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Expiry Date</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.placeHolder}
                    keyboardType="number-pad"
                    maxLength={5}
                    style={styles.input}
                  />
                </View>
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>CVV</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    value={cvv}
                    onChangeText={text => setCvv(text.replace(/\D/g, '').slice(0, 4))}
                    placeholder="CVV"
                    placeholderTextColor={colors.placeHolder}
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={4}
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.label}>Card Holder Name</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={cardHolderName}
                onChangeText={setCardHolderName}
                placeholder="Enter card holder name"
                placeholderTextColor={colors.placeHolder}
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            <CustomButton title="Add" onPress={handleAdd} buttonStyle={styles.addButton} />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddNewCardScreen;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.black,
    opacity: 0.4,
  },
  sheetWrap: {
    maxHeight: '82%',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: wp(24),
    borderTopRightRadius: wp(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(20),
    paddingTop: hp(20),
    paddingBottom: hp(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightWhite,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
  },
  closeButton: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPlaceHolderColor,
  },
  form: {
    padding: wp(20),
  },
  label: {
    marginBottom: hp(8),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(52),
    borderRadius: wp(12),
    paddingHorizontal: wp(16),
    backgroundColor: colors.textPlaceHolderColor,
    marginBottom: hp(18),
  },
  input: {
    flex: 1,
    padding: 0,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  visaText: {
    color: '#1A1F71',
    fontSize: fontSize(13),
    fontStyle: 'italic',
    fontFamily: fonts.Lato700,
  },
  row: {
    flexDirection: 'row',
    gap: wp(14),
  },
  half: {
    flex: 1,
  },
  addButton: {
    marginTop: hp(4),
  },
});
