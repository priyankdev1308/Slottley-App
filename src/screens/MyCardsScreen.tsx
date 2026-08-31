import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../assets/icons';
import { MastercardIcon, PlusCircleIcon, TrashIcon } from '../components/icons/CardIcons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { MyCardsScreenProps } from '../interface/screenTypes';
import { SavedCard } from '../interface/common';

// TODO: replace with the signed-in user's real saved cards once this screen
// is wired to a backend/payment provider.
const INITIAL_CARDS: SavedCard[] = [
  { id: '1', brand: 'mastercard', first4: '1235', last4: '7896' },
  { id: '2', brand: 'visa', first4: '1235', last4: '7896' },
  { id: '3', brand: 'mastercard', first4: '1235', last4: '7896' },
  { id: '4', brand: 'visa', first4: '1235', last4: '7896' },
];

const MyCardsScreen = ({ navigation }: MyCardsScreenProps) => {
  const [cards, setCards] = useState<SavedCard[]>(INITIAL_CARDS);

  const handleDelete = (id: string) => {
    Alert.alert('Remove card', 'Are you sure you want to remove this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setCards(prev => prev.filter(card => card.id !== id)),
      },
    ]);
  };

  const handleAdd = (card: SavedCard) => {
    setCards(prev => [...prev, card]);
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerShadowStrip} />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>
          My Cards
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {cards.map(card => (
          <View key={card.id} style={styles.cardRow}>
            {card.brand === 'mastercard' ? (
              <MastercardIcon size={30} />
            ) : (
              <Text style={styles.visaText}>VISA</Text>
            )}
            <Text style={styles.cardNumber}>
              {card.first4} XXXX XXXX {card.last4}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleDelete(card.id)}
              style={styles.deleteButton}
            >
              <TrashIcon size={16} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AddNewCardScreen', { onAdd: handleAdd })}
          style={styles.addCardButton}
        >
          <PlusCircleIcon color={colors.primary} />
          <Text style={styles.addCardText}>Add New Card</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyCardsScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
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
    width: wp(38),
    height: wp(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: wp(24),
    height: wp(24),
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
  },
  content: {
    paddingHorizontal: wp(20),
    paddingTop: hp(20),
    paddingBottom: hp(40),
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: wp(14),
    paddingVertical: hp(16),
    paddingHorizontal: wp(16),
    marginBottom: hp(14),
    gap: wp(14),
    borderWidth: 1,
    borderColor: '#0000001A',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  visaText: {
    width: wp(30),
    color: '#1A1F71',
    fontSize: fontSize(13),
    fontStyle: 'italic',
    fontFamily: fonts.Lato700,
  },
  cardNumber: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato600,
  },
  deleteButton: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightRed,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(10),
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.sage,
    borderRadius: wp(12),
    paddingVertical: hp(16),
    marginTop: hp(8),
  },
  addCardText: {
    color: colors.primary,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
});
