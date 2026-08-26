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
import ToastAlert from '../components/ToastAlert';
import { MastercardIcon, VisaIcon } from '../components/icons/PaymentIcons';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { HostPaymentScreenProps } from '../interface/screenTypes';
import { SavedCard } from '../interface/common';
import { HOST_JOBS } from './HostMyJobScreen';

const SUMMARY = [
  { label: 'Job Post Charge', value: '£49' },
  { label: 'Platform Fee', value: '£5' },
];

const GRAND_TOTAL = '£54';

interface PaymentCard {
  id: string;
  brand: 'mastercard' | 'visa';
  number: string;
}

const INITIAL_CARDS: PaymentCard[] = [
  { id: 'c1', brand: 'mastercard', number: '1235 XXXX XXXX 7896' },
  { id: 'c2', brand: 'visa', number: '1235 XXXX XXXX 7896' },
];

const HostPaymentScreen = ({ navigation, route }: HostPaymentScreenProps) => {
  const job = HOST_JOBS.find(j => j.id === route.params?.jobId) ?? HOST_JOBS[0];
  const [cards, setCards] = useState<PaymentCard[]>(INITIAL_CARDS);
  const [selectedCard, setSelectedCard] = useState(INITIAL_CARDS[0].id);

  const handleAddCard = (card: SavedCard) => {
    const newCard: PaymentCard = {
      id: card.id,
      brand: card.brand,
      number: `${card.first4} XXXX XXXX ${card.last4}`,
    };
    setCards(prev => [...prev, newCard]);
    setSelectedCard(newCard.id);
  };

  const handlePay = () => {
    ToastAlert({ title: 'Job Posted', description: 'Your job listing is now live.' });
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { userRole: 'host', initialTab: 'Job' } }],
    });
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
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.bookingTitle}>{job.title}</Text>
          <Text style={styles.company}>{job.company}</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Image source={icons.mapPin} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.detailText}>{job.location}</Text>
            </View>
            <View style={styles.detailItem}>
              <Image source={icons.clock} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.detailText}>{job.schedule}</Text>
            </View>
          </View>

          <Text style={styles.description}>{job.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.summaryTitle}>Summary</Text>
          {SUMMARY.map(row => (
            <View key={row.label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={styles.summaryValue}>{row.value}</Text>
            </View>
          ))}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>{GRAND_TOTAL}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Select Payment Method</Text>
        {cards.map(cardItem => {
          const isSelected = selectedCard === cardItem.id;
          return (
            <TouchableOpacity
              key={cardItem.id}
              activeOpacity={0.85}
              style={styles.cardRow}
              onPress={() => setSelectedCard(cardItem.id)}
            >
              {cardItem.brand === 'mastercard' ? <MastercardIcon /> : <VisaIcon />}
              <Text style={styles.cardNumber}>{cardItem.number}</Text>
              <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.addCardButton}
          onPress={() => navigation.navigate('AddNewCardScreen', { onAdd: handleAddCard })}
        >
          <Image
            source={icons.add}
            style={[styles.addIcon, { tintColor: colors.primary }]}
            resizeMode="contain"
          />
          <Text style={styles.addCardText}>Add New Card</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton title={`Pay ${GRAND_TOTAL}`} onPress={handlePay} />
      </View>
    </SafeAreaView>
  );
};

export default HostPaymentScreen;

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
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
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
    marginBottom: hp(16),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingTitle: {
    color: colors.black,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato700,
  },
  company: {
    marginTop: hp(4),
    color: colors.subText,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato500,
  },
  detailRow: {
    flexDirection: 'row',
    marginTop: hp(12),
    marginBottom: hp(10),
    gap: wp(20),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    width: wp(16),
    height: wp(16),
    marginRight: wp(6),
    tintColor: colors.primary,
  },
  detailText: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  description: {
    marginTop: hp(4),
    color: colors.subText,
    fontSize: fontSize(13.5),
    lineHeight: fontSize(19),
    fontFamily: fonts.Lato400,
  },
  summaryTitle: {
    color: colors.black,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato700,
    marginBottom: hp(14),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(14),
  },
  summaryLabel: {
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  summaryValue: {
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato600,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.EBEBEB,
    marginBottom: hp(14),
  },
  grandTotalLabel: {
    color: colors.black,
    fontSize: fontSize(16.5),
    fontFamily: fonts.Lato700,
  },
  grandTotalValue: {
    color: colors.primary,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato700,
  },
  sectionLabel: {
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
    marginBottom: hp(12),
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(60),
    paddingHorizontal: wp(16),
    borderRadius: wp(14),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.EBEBEB,
    marginBottom: hp(12),
  },
  cardNumber: {
    flex: 1,
    marginLeft: wp(14),
    color: colors.black,
    fontSize: fontSize(14.5),
    fontFamily: fonts.Lato400,
  },
  radioOuter: {
    width: wp(22),
    height: wp(22),
    borderRadius: wp(11),
    borderWidth: 2,
    borderColor: colors.EBEBEB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(5.5),
    backgroundColor: colors.primary,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: hp(56),
    borderRadius: wp(14),
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    marginTop: hp(4),
  },
  addIcon: {
    width: wp(18),
    height: wp(18),
    marginRight: wp(8),
  },
  addCardText: {
    color: colors.primary,
    fontSize: fontSize(14.5),
    fontFamily: fonts.Lato700,
  },
  footer: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(16),
  },
});
