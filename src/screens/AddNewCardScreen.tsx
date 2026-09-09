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
import { STRIPE_PUBLISHABLE_KEY } from '@env';

import CustomButton from '../components/CustomButton';
import ToastAlert from '../components/ToastAlert';
import {
  CloseIcon,
  getCardBrandIcon,
  detectCardBrand,
  formatCardNumber,
  formatExpiryInput,
} from '../components/icons/CardIcons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp, isIos } from '../helpers/responsive';
import { AddNewCardScreenProps } from '../interface/screenTypes';
import { supabase } from '../api/supabaseClient';

// Luhn checksum — catches obvious typos before we ever contact Stripe.
const isValidLuhn = (digits: string) => {
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
};

const AddNewCardScreen = ({ navigation, route }: AddNewCardScreenProps) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const digits = cardNumber.replace(/\D/g, '');
  const brand = detectCardBrand(digits);

  const handleClose = () => navigation.goBack();

  // The raw card number/expiry/CVC go straight to Stripe's own API from
  // here, using the PUBLISHABLE key — they never pass through our own
  // server. Only the resulting token (paymentMethod.id) is sent to the
  // add-card Edge Function, which attaches it with the SECRET key.
  const handleAdd = async () => {
    const expectedLength = brand === 'amex' ? 15 : 16;
    if (digits.length !== expectedLength || !isValidLuhn(digits)) {
      ToastAlert({ title: 'Invalid card number', description: 'Please enter a valid card number.' });
      return;
    }

    const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiryDate);
    if (!expiryMatch) {
      ToastAlert({ title: 'Invalid expiry date', description: 'Use the format MM/YY.' });
      return;
    }
    const expMonth = parseInt(expiryMatch[1], 10);
    const expYear = 2000 + parseInt(expiryMatch[2], 10);
    const now = new Date();
    const isPast =
      expMonth < 1 || expMonth > 12 ||
      expYear < now.getFullYear() ||
      (expYear === now.getFullYear() && expMonth < now.getMonth() + 1);
    if (isPast) {
      ToastAlert({ title: 'Invalid expiry date', description: 'This card has expired.' });
      return;
    }

    const expectedCvvLength = brand === 'amex' ? 4 : 3;
    if (cvv.length !== expectedCvvLength) {
      ToastAlert({ title: 'Invalid CVV', description: 'Enter a valid CVV.' });
      return;
    }

    if (!cardHolderName.trim()) {
      ToastAlert({ title: 'Card holder name required', description: 'Please enter the name on the card.' });
      return;
    }

    setSubmitting(true);

    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${STRIPE_PUBLISHABLE_KEY ?? ''}`,
      },
      body: new URLSearchParams({
        type: 'card',
        'card[number]': digits,
        'card[exp_month]': String(expMonth),
        'card[exp_year]': String(expYear),
        'card[cvc]': cvv,
        'billing_details[name]': cardHolderName.trim(),
      }).toString(),
    });
    const stripeResult = await stripeResponse.json();

    if (!stripeResponse.ok) {
      setSubmitting(false);
      ToastAlert({ title: 'Could not process card', description: stripeResult.error?.message ?? 'Please try again.' });
      return;
    }

    const { data, error: fnError } = await supabase.functions.invoke('add-card', {
      body: { paymentMethodId: stripeResult.id },
    });
    setSubmitting(false);

    if (fnError || !data) {
      ToastAlert({ title: 'Could not save card', description: fnError?.message ?? 'Please try again.' });
      return;
    }

    route.params.onAdd({
      id: data.id,
      brand: data.brand,
      last4: data.last4,
      expMonth: data.expMonth,
      expYear: data.expYear,
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
                onChangeText={text => setCardNumber(formatCardNumber(text, detectCardBrand(text.replace(/\D/g, ''))))}
                placeholder="XXXX XXXX XXXX XXXX"
                placeholderTextColor={colors.placeHolder}
                keyboardType="number-pad"
                style={styles.input}
              />
              {brand && getCardBrandIcon(brand, 30)}
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Expiry Date</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    value={expiryDate}
                    onChangeText={text => setExpiryDate(formatExpiryInput(text))}
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

            <CustomButton
              title="Add"
              onPress={handleAdd}
              loader={submitting}
              disable={submitting}
              buttonStyle={styles.addButton}
            />
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
