import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { RentAgreementScreenProps } from '../interface/screenTypes';

const CLAUSES = [
  {
    title: '1. Use of Space',
    body: 'The space must only be used for the professional purpose stated in the booking. Any misuse or illegal activity is strictly prohibited.',
  },
  {
    title: '2. Booking & Payment',
    body: 'Your booking is subject to availability and confirmation. Full payment is required at the time of booking.',
  },
  {
    title: '3. Cancellation Policy',
    body: "Cancellation terms and any applicable refund will be based on the platform's cancellation policy.",
  },
  {
    title: '4. Responsibility & Liability',
    body: 'The customer is responsible for using the space appropriately and for any damage caused during the booking period.',
  },
  {
    title: '5. Access & Conduct',
    body: 'The space may only be accessed during the booked time. Customers must maintain a respectful and professional environment.',
  },
  {
    title: '6. Self-Employed Status',
    body: 'By booking this space, you confirm that you are operating as a self-employed, independent professional. You are solely responsible for your own tax, National Insurance, and business affairs. Booking a specific time slot does not create any employment or worker relationship with Slottley or the host',
  },
];

const RentAgreementScreen = ({ navigation }: RentAgreementScreenProps) => {
  const [accepted, setAccepted] = useState(false);

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
        <Text style={styles.headerTitle}>Rent Agreement</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {CLAUSES.map(clause => (
          <View key={clause.title} style={styles.card}>
            <Text style={styles.cardTitle}>{clause.title}</Text>
            <Text style={styles.cardBody}>{clause.body}</Text>
          </View>
        ))}

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.acceptRow}
          onPress={() => setAccepted(v => !v)}
        >
          {accepted ? (
            <Image source={icons.checkBox} style={styles.checkbox} resizeMode="contain" />
          ) : (
            <View style={styles.checkboxEmpty} />
          )}
          <Text style={styles.acceptText}>
            I have read and accept the Standard Rent Agreement
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Accept & Continue"
          disable={!accepted}
          onPress={() => navigation.navigate('PaymentScreen')}
        />
      </View>
    </SafeAreaView>
  );
};

export default RentAgreementScreen;

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
    paddingTop: hp(10),
    paddingBottom: hp(20),
  },
  card: {
    padding: wp(16),
    borderRadius: wp(16),
    backgroundColor: colors.white,
    marginBottom: hp(14),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  cardBody: {
    marginTop: hp(8),
    color: colors.subText,
    fontSize: fontSize(14),
    lineHeight: fontSize(19),
    fontFamily: fonts.Lato600,
  },
  acceptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(6),
  },
  checkbox: {
    width: wp(24),
    height: wp(24),
    marginRight: wp(12),
  },
  checkboxEmpty: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(6),
    borderWidth: 1.5,
    borderColor: colors.EBEBEB,
    marginRight: wp(12),
  },
  acceptText: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato600,
  },
  footer: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(16),
  },
});
