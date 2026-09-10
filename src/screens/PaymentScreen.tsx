import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FunctionsHttpError } from '@supabase/supabase-js';

import CustomButton from '../components/CustomButton';
import ToastAlert from '../components/ToastAlert';
import { getCardBrandIcon } from '../components/icons/CardIcons';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { PaymentScreenProps } from '../interface/screenTypes';
import { SavedCard } from '../interface/common';
import { buildBookingLabels } from '../api/bookings';
import { supabase } from '../api/supabaseClient';

interface PaymentCard {
  id: string;
  brand: SavedCard['brand'];
  number: string;
}

const PaymentScreen = ({ navigation, route }: PaymentScreenProps) => {
  const { draft } = route.params;

  const [paying, setPaying] = useState(false);
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.functions.invoke('list-cards');
      if (!cancelled) {
        if (!error && data?.cards) {
          const mapped: PaymentCard[] = data.cards.map((card: SavedCard) => ({
            id: card.id,
            brand: card.brand,
            number: `XXXX XXXX XXXX ${card.last4}`,
          }));
          setCards(mapped);
          setSelectedCard(prev => prev ?? mapped[0]?.id ?? null);
        }
        setCardsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;
      const { data } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', authData.user.id)
        .single();
      if (!cancelled) setWalletBalance(Math.max(data?.wallet_balance ?? 0, 0));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddCard = (card: SavedCard) => {
    const newCard: PaymentCard = {
      id: card.id,
      brand: card.brand,
      number: `XXXX XXXX XXXX ${card.last4}`,
    };
    setCards(prev => [...prev, newCard]);
    setSelectedCard(newCard.id);
  };

  // Platform commission still has no business rule defined, so it stays at
  // £0 rather than fabricating a number. Referral credit is the renter's
  // real wallet_balance, capped so it can never discount below £0 — the
  // Edge Function independently re-derives and re-spends this same amount
  // server-side, so this is purely for display/UI purposes here.
  const commission = 0;
  const referralCredit = Math.min(walletBalance, draft.totalPrice);
  const grandTotal = draft.totalPrice + commission - referralCredit;

  const handlePay = async () => {
    if (grandTotal > 0 && !selectedCard) {
      ToastAlert({ title: 'Select a card', description: 'Choose a saved card to pay with.' });
      return;
    }

    setPaying(true);
    const { data, error } = await supabase.functions.invoke('create-booking-payment', {
      body: {
        paymentMethodId: selectedCard,
        placeId: draft.placeId,
        bookingType: draft.bookingType,
        startDateTime: draft.startDateTime,
        endDateTime: draft.endDateTime,
        quantity: draft.quantity,
        rate: draft.rate,
        totalPrice: draft.totalPrice,
      },
    });
    setPaying(false);

    if (error || !data?.bookingId) {
      let description = 'Please try again or use a different card.';
      if (error instanceof FunctionsHttpError) {
        try {
          const body = await error.context.json();
          description = body?.error ?? description;
        } catch {
          // response body wasn't JSON — fall back to the generic message
        }
      }
      ToastAlert({ title: 'Payment failed', description });
      return;
    }
    navigation.navigate('BookingConfirmationScreen', { bookingId: data.bookingId });
  };

  const { timeLabel, dateLabel } = buildBookingLabels(
    draft.bookingType,
    draft.startDateTime,
    draft.endDateTime,
    draft.quantity,
  );

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
            <Image source={draft.placeImage} style={styles.bookingImage} resizeMode="cover" />
            <View style={styles.bookingTextCol}>
              <Text style={styles.bookingTitle}>{draft.placeTitle}</Text>
              <View style={styles.bookingMetaRow}>
                <Image source={icons.mapPin} style={styles.metaIcon} resizeMode="contain" />
                <Text style={styles.bookingMetaText}>{draft.placeLocation}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Image source={icons.clock} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.detailText}>{timeLabel}</Text>
            </View>
            <View style={styles.detailItem}>
              <Image source={icons.calendar} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.detailText}>{dateLabel}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Image source={icons.money} style={styles.metaIcon} resizeMode="contain" />
            <Text style={styles.detailText}>£{draft.totalPrice}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.summaryTitle}>Summary</Text>
          {[
            { label: 'Place Price', value: `£${draft.totalPrice}` },
            // { label: 'Platform Commission', value: `£${commission}` },
            { label: 'Referral & Earn Credit', value: referralCredit ? `- £${referralCredit}` : `£${referralCredit}` },
          ].map(row => (
            <View key={row.label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={styles.summaryValue}>{row.value}</Text>
            </View>
          ))}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>£{grandTotal}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Select Payment Method</Text>
        {cardsLoading ? (
          <View style={styles.cardsLoadingWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <>
            {cards.length === 0 && (
              <Text style={styles.summaryLabel}>No saved cards yet. Add one below.</Text>
            )}
            {cards.map(card => {
              const isSelected = selectedCard === card.id;
              return (
                <TouchableOpacity
                  key={card.id}
                  activeOpacity={0.85}
                  style={styles.cardRow}
                  onPress={() => setSelectedCard(card.id)}
                >
                  {getCardBrandIcon(card.brand)}
                  <Text style={styles.cardNumber}>{card.number}</Text>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

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
          title={grandTotal > 0 ? `Pay £${grandTotal}` : 'Confirm Booking'}
          onPress={handlePay}
          loader={paying}
          disable={paying}
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
    paddingTop: hp(20),
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
  cardsLoadingWrap: {
    paddingVertical: hp(20),
    alignItems: 'center',
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
