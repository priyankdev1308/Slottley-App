import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { icons } from '../../assets/icons';
import { getCardBrandIcon, formatExpiry, PlusCircleIcon, TrashIcon } from '../components/icons/CardIcons';
import ToastAlert from '../components/ToastAlert';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { MyCardsScreenProps } from '../interface/screenTypes';
import { SavedCard } from '../interface/common';
import { supabase } from '../api/supabaseClient';

const MyCardsScreen = ({ navigation }: MyCardsScreenProps) => {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);

      (async () => {
        const { data, error } = await supabase.functions.invoke('list-cards');
        if (!cancelled) {
          if (!error && data?.cards) setCards(data.cards);
          setLoading(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handleDelete = (id: string) => {
    Alert.alert('Remove card', 'Are you sure you want to remove this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.functions.invoke('remove-card', {
            body: { paymentMethodId: id },
          });
          if (error) {
            ToastAlert({ title: 'Could not remove card', description: 'Please try again.' });
            return;
          }
          setCards(prev => prev.filter(card => card.id !== id));
        },
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

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {cards.length === 0 && <Text style={styles.emptyText}>No saved cards yet.</Text>}
          {cards.map(card => (
            <View key={card.id} style={styles.cardRow}>
              {getCardBrandIcon(card.brand, 40)}
              <View style={styles.cardTextCol}>
                <Text style={styles.cardNumber}>XXXX XXXX XXXX {card.last4}</Text>
                {/* <Text style={styles.cardExpiry}>Expires {formatExpiry(card.expMonth, card.expYear)}</Text> */}
              </View>
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
      )}
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
    height: 3,
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.placeHolder,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
    marginTop: hp(40),
    marginBottom: hp(20),
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
  cardTextCol: {
    flex: 1,
  },
  cardNumber: {
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato600,
  },
  cardExpiry: {
    marginTop: hp(4),
    color: colors.placeHolder,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
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
