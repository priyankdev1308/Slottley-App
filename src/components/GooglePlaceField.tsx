import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { fetchPlaceDetails, fetchPlacePredictions, PlaceDetailsResult, PlacePrediction } from '../api/googlePlaces';

export type { PlaceDetailsResult };

interface GooglePlaceFieldProps {
  value: string;
  onSelect: (result: PlaceDetailsResult) => void;
  placeholder?: string;
}

const SEARCH_DEBOUNCE_MS = 350;

const GooglePlaceField = ({ value, onSelect, placeholder = 'Search address' }: GooglePlaceFieldProps) => {
  // <Modal> renders outside the app's SafeAreaProvider tree, so SafeAreaView
  // doesn't get real insets here — apply them manually instead.
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolvingPlaceId, setResolvingPlaceId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setPredictions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await fetchPlacePredictions(query);
      setPredictions(results);
      setSearching(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const openPicker = () => {
    setQuery('');
    setPredictions([]);
    setVisible(true);
  };

  const closePicker = () => {
    setVisible(false);
    setResolvingPlaceId(null);
  };

  const handleSelect = async (prediction: PlacePrediction) => {
    setResolvingPlaceId(prediction.placeId);
    const details = await fetchPlaceDetails(prediction.placeId);
    setResolvingPlaceId(null);

    if (!details) return;

    onSelect(details);
    closePicker();
  };

  return (
    <>
      <TouchableOpacity activeOpacity={0.85} style={styles.field} onPress={openPicker}>
        <Text style={[styles.fieldText, !value && styles.fieldPlaceholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Image source={icons.mapPin} style={styles.pinIcon} resizeMode="contain" />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" onRequestClose={closePicker}>
        <View style={[styles.modalFlex, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Search Address</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={closePicker} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Image source={icons.search_black} style={styles.searchIcon} resizeMode="contain" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Start typing an address..."
              placeholderTextColor={colors.placeHolder}
              autoFocus
              style={styles.searchInput}
            />
          </View>

          {searching && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loadingIndicator} />
          )}

          <FlatList
            data={predictions}
            keyExtractor={item => item.placeId}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.resultRow}
                disabled={!!resolvingPlaceId}
                onPress={() => handleSelect(item)}
              >
                <Image source={icons.mapPin} style={styles.resultIcon} resizeMode="contain" />
                <Text style={styles.resultText} numberOfLines={2}>
                  {item.description}
                </Text>
                {resolvingPlaceId === item.placeId && (
                  <ActivityIndicator size="small" color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !searching && query.trim() ? (
                <Text style={styles.emptyText}>No matching addresses found.</Text>
              ) : null
            }
          />
        </View>
      </Modal>
    </>
  );
};

export default GooglePlaceField;

const styles = StyleSheet.create({
  field: {
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
  fieldText: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  fieldPlaceholder: {
    color: colors.placeHolder,
  },
  pinIcon: {
    width: wp(18),
    height: wp(18),
    tintColor: colors.primary,
  },
  modalFlex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(20),
    paddingVertical: hp(14),
  },
  modalTitle: {
    color: colors.black,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato600,
  },
  closeButton: {
    paddingVertical: hp(6),
    paddingHorizontal: wp(4),
  },
  closeButtonText: {
    color: colors.primary,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp(20),
    paddingHorizontal: wp(16),
    height: hp(50),
    borderRadius: wp(12),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
  },
  searchIcon: {
    width: wp(18),
    height: wp(18),
    marginRight: wp(10),
  },
  searchInput: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  loadingIndicator: {
    marginTop: hp(16),
  },
  listContent: {
    paddingHorizontal: wp(20),
    paddingTop: hp(16),
    paddingBottom: hp(24),
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.EBEBEB,
  },
  resultIcon: {
    width: wp(18),
    height: wp(18),
    marginRight: wp(12),
    tintColor: colors.primary,
  },
  resultText: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  emptyText: {
    marginTop: hp(24),
    textAlign: 'center',
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
});
