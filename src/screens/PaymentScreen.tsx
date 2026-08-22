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
import { MastercardIcon, VisaIcon } from '../components/icons/PaymentIcons';
import { icons } from '../../assets/icons';
import { images } from '../../assets/images';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { PaymentScreenProps } from '../interface/screenTypes';
import { SavedCard } from '../interface/common';

// Mock booking summary — will come from the booking/payment API.
const BOOKING = {
  title: 'Hair Apprentice',
  location: 'London, UK',
  time: '10:00 AM - 12:00 PM',
  date: 'Thur, 20 Aug 2026',
  price: '£120',
  image: images.dummy2,
};

const SUMMARY = [
  { label: 'Place Price', value: '£120' },
  { label: 'Platform Commission', value: '£18' },
  { label: 'Referral & Earn Credit', value: '- £25' },
];

const GRAND_TOTAL = '£113';

interface PaymentCard {
  id: string;
  brand: 'mastercard' | 'visa';
  number: string;
}

const INITIAL_CARDS: PaymentCard[] = [
  { id: 'c1', brand: 'mastercard', number: '1235 XXXX XXXX 7896' },
  { id: 'c2', brand: 'visa', number: '1235 XXXX XXXX 7896' },
];

const PaymentScreen = ({ navigation }: PaymentScreenProps) => {
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
          <View style={styles.bookingRow}>
            <Image source={BOOKING.image} style={styles.bookingImage} resizeMode="cover" />
            <View style={styles.bookingTextCol}>
              <Text style={styles.bookingTitle}>{BOOKING.title}</Text>
              <View style={styles.bookingMetaRow}>
                <Image source={icons.mapPin} style={styles.metaIcon} resizeMode="contain" />
                <Text style={styles.bookingMetaText}>{BOOKING.location}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Image source={icons.clock} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.detailText}>{BOOKING.time}</Text>
            </View>
            <View style={styles.detailItem}>
              <Image source={icons.calendar} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.detailText}>{BOOKING.date}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Image source={icons.money} style={styles.metaIcon} resizeMode="contain" />
            <Text style={styles.detailText}>{BOOKING.price}</Text>
          </View>
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
        {cards.map(card => {
          const isSelected = selectedCard === card.id;
          return (
            <TouchableOpacity
              key={card.id}
              activeOpacity={0.85}
              style={styles.cardRow}
              onPress={() => setSelectedCard(card.id)}
            >
              {card.brand === 'mastercard' ? <MastercardIcon /> : <VisaIcon />}
              <Text style={styles.cardNumber}>{card.number}</Text>
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
        <CustomButton
          title={`Pay ${GRAND_TOTAL}`}
          onPress={() => navigation.navigate('BookingConfirmationScreen')}
        />
      </View>
    </SafeAreaView>
  );
};

export default PaymentScreen;

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
    fontWeight: 600
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
  bookingRow: {
    flexDirection: 'row',
    marginBottom: hp(14),
  },
  bookingImage: {
    width: wp(64),
    height: wp(64),
    borderRadius: wp(12),
    marginRight: wp(12),
  },
  bookingTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  bookingTitle: {
    color: colors.black,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato700,
  },
  bookingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(6),
  },
  bookingMetaText: {
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  detailRow: {
    flexDirection: 'row',
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
  },
  detailText: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
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
    fontWeight: 600
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
