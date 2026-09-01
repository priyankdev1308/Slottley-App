import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';

import CustomButton from '../components/CustomButton';
import DateField from '../components/DateField';
import GooglePlaceField from '../components/GooglePlaceField';
import ToastAlert from '../components/ToastAlert';
import { CloseIcon } from '../components/icons/CardIcons';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { supabase } from '../api/supabaseClient';
import { PLACE_CATEGORIES, PlaceCategory } from '../utils/placeCategories';
import { AddNewPlaceScreenProps } from '../interface/screenTypes';

const PLACE_IMAGE_BUCKET = 'place_images';

// UI photo-slot keys vs. the `place_images.slot` check-constraint values.
const SLOT_TO_DB: Record<string, string> = {
  reception: 'reception',
  work: 'work',
  backwash: 'backwash',
  more: 'extra',
};

const toISODate = (ddmmyyyy: string): string | null => {
  const match = ddmmyyyy.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const parsePrice = (value: string): number | null => {
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
};

interface PhotoSlot {
  key: string;
  caption: string;
}

const PHOTO_SLOTS: PhotoSlot[] = [
  { key: 'reception', caption: 'Add Reception Area' },
  { key: 'work', caption: 'Add Work Area' },
  { key: 'backwash', caption: 'Add Backwash Area' },
  { key: 'more', caption: 'Add More Image' },
];

// Pairs up the narrow cards two-per-row and keeps full-width cards on their own row.
const CATEGORY_ROWS: PlaceCategory[][] = (() => {
  const rows: PlaceCategory[][] = [];
  let pair: PlaceCategory[] = [];
  PLACE_CATEGORIES.forEach(item => {
    if (item.fullWidth) {
      if (pair.length) {
        rows.push(pair);
        pair = [];
      }
      rows.push([item]);
    } else {
      pair.push(item);
      if (pair.length === 2) {
        rows.push(pair);
        pair = [];
      }
    }
  });
  if (pair.length) rows.push(pair);
  return rows;
})();

interface CancellationOption {
  key: string;
  title: string;
  bullets: string[];
}

const CANCELLATION_OPTIONS: CancellationOption[] = [
  { key: 'nonrefundable', title: 'Non-refundable', bullets: ['No refund if cancelled.'] },
  {
    key: 'moderate',
    title: 'Moderate',
    bullets: [
      '14+ days before: refund allowed',
      '7–13 days before: 50% refund',
      'Less than 7 days: no refund',
    ],
  },
  {
    key: 'flexible',
    title: 'Flexible',
    bullets: [
      '30+ days before: refund allowed',
      '14–29 days before: 50% refund',
      'Less than 14 days: no refund',
    ],
  },
];

const DEFAULT_AMENITIES = ['Wi-Fi', 'Mirror', 'Music System', 'AC', 'Lights', 'Fan', 'Towels'];
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface PricingFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

const PricingField = ({ label, value, onChangeText, enabled, onToggle }: PricingFieldProps) => (
  <View style={styles.pricingField}>
    <View style={styles.pricingFieldHeader}>
      <Text style={styles.pricingFieldLabel}>{label}</Text>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: colors.EBEBEB, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      editable={enabled}
      placeholder="Enter price"
      placeholderTextColor={colors.placeHolder}
      keyboardType="numeric"
      style={[styles.input, !enabled && styles.inputDisabled]}
    />
  </View>
);

const AddNewPlaceScreen = ({ navigation }: AddNewPlaceScreenProps) => {
  const [spaceType, setSpaceType] = useState('beauty');
  const [aestheticsRoom, setAestheticsRoom] = useState(true);
  const [cqcRegisteredOnly, setCqcRegisteredOnly] = useState(true);
  const [cancellationPolicy, setCancellationPolicy] = useState('nonrefundable');
  const [availableDays, setAvailableDays] = useState<string[]>([]);

  const [title, setTitle] = useState('');
  const [about, setAbout] = useState(
    '',
  );
  const [businessName, setBusinessName] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [areaTown, setAreaTown] = useState('');
  const [postCode, setPostCode] = useState('');
  const [minBookingLength, setMinBookingLength] = useState('7');
  const [minBookingError, setMinBookingError] = useState('');

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Music System']);

  const [includedInput, setIncludedInput] = useState('');
  const [includedItems, setIncludedItems] = useState<string[]>(['Shampoo', 'Tea & Coffee']);

  const [hourlyPrice, setHourlyPrice] = useState('£');
  const [dailyPrice, setDailyPrice] = useState('£');
  const [weeklyPrice, setWeeklyPrice] = useState('£');
  const [monthlyPrice, setMonthlyPrice] = useState('£');

  const [hourlyEnabled, setHourlyEnabled] = useState(false);
  const [dailyEnabled, setDailyEnabled] = useState(false);
  const [weeklyEnabled, setWeeklyEnabled] = useState(false);
  const [monthlyEnabled, setMonthlyEnabled] = useState(false);

  const [startDate, setStartDate] = useState('15/12/2026');
  const [endDate, setEndDate] = useState('17/12/2026');

  const [instantBooking, setInstantBooking] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [photos, setPhotos] = useState<Partial<Record<string, Asset>>>({});
  const [submitting, setSubmitting] = useState(false);

  const toggleAmenity = (item: string) => {
    setSelectedAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item],
    );
  };

  const toggleDay = (day: string) => {
    setAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const getRequiredMinBookingDays = (weeklyEnabled: boolean, monthlyEnabled: boolean) => {
    if (monthlyEnabled) return 60;
    if (weeklyEnabled) return 7;
    return 1;
  };

  const handleMinBookingChange = (text: string) => {
    setMinBookingLength(text);

    const numeric = parseInt(text, 10);
    const requiredMin = getRequiredMinBookingDays(weeklyEnabled, monthlyEnabled);

    if (!text.trim() || isNaN(numeric)) {
      setMinBookingError('Please enter a valid number of days');
    } else if (numeric < requiredMin) {
      setMinBookingError(`Minimum booking must be at least ${requiredMin} days`);
    } else {
      setMinBookingError('');
    }
  };

  const handleAddAmenity = () => {
    ToastAlert({ title: 'Add Amenity', description: 'Coming soon.' });
  };

  const handlePickPhoto = (slotKey: string, source: 'camera' | 'library') => {
    if (source === 'camera') {
      launchCamera({ mediaType: 'photo', quality: 0.8 }, response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          ToastAlert({
            title: 'Could not open picker',
            description: response.errorMessage || response.errorCode,
          });
          return;
        }
        const asset = response.assets?.[0];
        if (asset) setPhotos(prev => ({ ...prev, [slotKey]: asset }));
      });
      return;
    }

    // Fills the tapped slot first, then any other still-empty slots in
    // order, so picking several photos at once (up to 4 total) spreads
    // across the remaining boxes instead of only filling the one tapped.
    const startIndex = PHOTO_SLOTS.findIndex(slot => slot.key === slotKey);
    const fillOrder = [...PHOTO_SLOTS.slice(startIndex), ...PHOTO_SLOTS.slice(0, startIndex)]
      .map(slot => slot.key)
      .filter(key => !photos[key]);

    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, selectionLimit: fillOrder.length },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          ToastAlert({
            title: 'Could not open picker',
            description: response.errorMessage || response.errorCode,
          });
          return;
        }
        const assets = response.assets ?? [];
        if (!assets.length) return;

        setPhotos(prev => {
          const next = { ...prev };
          assets.slice(0, fillOrder.length).forEach((asset, i) => {
            next[fillOrder[i]] = asset;
          });
          return next;
        });
      },
    );
  };

  const handleAddPhoto = (slotKey: string) => {
    const emptySlotCount = PHOTO_SLOTS.filter(slot => !photos[slot.key]).length;
    Alert.alert('Upload Photo', undefined, [
      { text: 'Take Photo', onPress: () => handlePickPhoto(slotKey, 'camera') },
      {
        text: emptySlotCount > 1 ? `Choose from Library (up to ${emptySlotCount})` : 'Choose from Library',
        onPress: () => handlePickPhoto(slotKey, 'library'),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemovePhoto = (slotKey: string) => {
    setPhotos(prev => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  };

  const handleAddIncludedItem = () => {
    const value = includedInput.trim();
    if (!value || includedItems.includes(value)) return;
    setIncludedItems(prev => [...prev, value]);
    setIncludedInput('');
  };

  const removeIncludedItem = (item: string) => {
    setIncludedItems(prev => prev.filter(i => i !== item));
  };

  const uploadPlacePhoto = async (
    hostId: string,
    placeId: string,
    slotKey: string,
    asset: Asset,
  ): Promise<string | null> => {
    if (!asset.uri) return null;

    const response = await fetch(asset.uri);
    const arrayBuffer = await response.arrayBuffer();
    const ext =
      asset.fileName?.split('.').pop()?.toLowerCase() ||
      asset.uri.split('.').pop()?.toLowerCase() ||
      'jpg';
    const dbSlot = SLOT_TO_DB[slotKey] ?? 'extra';
    const path = `${hostId}/${placeId}/${dbSlot}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(PLACE_IMAGE_BUCKET)
      .upload(path, arrayBuffer, {
        contentType: asset.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      ToastAlert({ title: 'Photo upload failed', description: uploadError.message });
      return null;
    }

    return path;
  };

  const handleAddPlace = async () => {
    const requiredMin = getRequiredMinBookingDays(weeklyEnabled, monthlyEnabled);
    const numeric = parseInt(minBookingLength, 10);

    if (isNaN(numeric) || numeric < requiredMin) {
      setMinBookingError(`Minimum booking must be at least ${requiredMin} days`);
      ToastAlert({ title: 'Invalid Minimum Booking', description: `Must be at least ${requiredMin} days.` });
      return;
    }

    if (!title.trim()) {
      ToastAlert({ title: 'Title required', description: 'Please enter a title for your space.' });
      return;
    }

    if (!addressStreet.trim()) {
      ToastAlert({ title: 'Address required', description: 'Please search and select your address.' });
      return;
    }

    if (!agreeTerms) {
      ToastAlert({
        title: 'Terms required',
        description: "Please agree to Slottley's Terms & Conditions to continue.",
      });
      return;
    }

    const pricingTiers: Array<{ enabled: boolean; value: string; label: string }> = [
      { enabled: hourlyEnabled, value: hourlyPrice, label: 'Hourly' },
      { enabled: dailyEnabled, value: dailyPrice, label: 'Daily' },
      { enabled: weeklyEnabled, value: weeklyPrice, label: 'Weekly' },
      { enabled: monthlyEnabled, value: monthlyPrice, label: 'Monthly' },
    ];
    for (const tier of pricingTiers) {
      if (tier.enabled && (parsePrice(tier.value) ?? 0) <= 0) {
        ToastAlert({
          title: 'Invalid pricing',
          description: `Please enter a valid ${tier.label.toLowerCase()} price.`,
        });
        return;
      }
    }

    setSubmitting(true);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setSubmitting(false);
      ToastAlert({ title: 'Not signed in', description: 'Please sign in again and retry.' });
      return;
    }
    const hostId = authData.user.id;

    const { data: inserted, error: insertError } = await supabase
      .from('places')
      .insert({
        host_id: hostId,
        title: title.trim(),
        about: about.trim() || null,
        business_name: businessName.trim() || null,
        address_street: addressStreet.trim(),
        area_town: areaTown.trim() || null,
        post_code: postCode.trim() || null,
        latitude,
        longitude,
        category: spaceType,
        aesthetics_room: aestheticsRoom,
        cqc_registered_only: aestheticsRoom ? cqcRegisteredOnly : false,
        cancellation_policy: cancellationPolicy,
        min_booking_days: numeric,
        amenities: selectedAmenities,
        included_items: includedItems,
        hourly_price: hourlyEnabled ? parsePrice(hourlyPrice) : null,
        hourly_enabled: hourlyEnabled,
        daily_price: dailyEnabled ? parsePrice(dailyPrice) : null,
        daily_enabled: dailyEnabled,
        weekly_price: weeklyEnabled ? parsePrice(weeklyPrice) : null,
        weekly_enabled: weeklyEnabled,
        monthly_price: monthlyEnabled ? parsePrice(monthlyPrice) : null,
        monthly_enabled: monthlyEnabled,
        available_days: dailyEnabled ? availableDays : [],
        available_from: toISODate(startDate),
        available_to: toISODate(endDate),
        instant_booking: instantBooking,
      })
      .select('id')
      .single();

    if (insertError || !inserted) {
      setSubmitting(false);
      ToastAlert({ title: 'Could not add place', description: insertError?.message ?? 'Please try again.' });
      return;
    }

    const placeId = inserted.id as string;

    const photoEntries = Object.entries(photos).filter(
      (entry): entry is [string, Asset] => !!entry[1],
    );
    const imageRows: { place_id: string; slot: string; path: string; sort_order: number }[] = [];

    for (let i = 0; i < photoEntries.length; i += 1) {
      const [slotKey, asset] = photoEntries[i];
      const path = await uploadPlacePhoto(hostId, placeId, slotKey, asset);
      if (path) {
        imageRows.push({ place_id: placeId, slot: SLOT_TO_DB[slotKey] ?? 'extra', path, sort_order: i });
      }
    }

    if (imageRows.length > 0) {
      const { error: imagesError } = await supabase.from('place_images').insert(imageRows);
      if (imagesError) {
        ToastAlert({ title: 'Some photos failed to save', description: imagesError.message });
      }
    }

    setSubmitting(false);
    ToastAlert({ title: 'Place added', description: 'Your space has been listed.' });
    navigation.goBack();
  };

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
        <Text style={styles.headerTitle}>Add New Place</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Photos</Text>
        <View style={styles.photoGrid}>
          {PHOTO_SLOTS.map(slot => {
            const asset = photos[slot.key];
            return (
              <View key={slot.key} style={styles.photoSlot}>
                {asset?.uri ? (
                  <>
                    <Image
                      source={{ uri: asset.uri }}
                      style={styles.photoPreview}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.photoRemoveBadge}
                      onPress={() => handleRemovePhoto(slot.key)}
                    >
                      <CloseIcon size={12} color={colors.red} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.photoPlusCircle}>
                      <Text style={styles.photoPlusText}>+</Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.photoAddButton}
                      onPress={() => handleAddPhoto(slot.key)}
                    >
                      <Text style={styles.photoAddButtonText}>Add</Text>
                    </TouchableOpacity>
                    <Text style={styles.photoCaption}>{slot.caption}</Text>
                  </>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Types Of Space</Text>
        <View style={styles.categoryGrid}>
          {CATEGORY_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.categoryRowWrap}>
              {row.map(item => {
                const isSelected = spaceType === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.85}
                    onPress={() => setSpaceType(item.key)}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                      item.key === 'all' && styles.optionCardCentered,
                    ]}
                  >
                    <View style={styles.categoryRow}>
                      <View
                        style={[
                          styles.categoryTextCol,
                          item.key === 'all' && styles.categoryTextColCentered,
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryTitle,
                            item.key === 'all' && styles.categoryTitleCentered,
                            !isSelected && styles.categoryTitleUnselected,
                          ]}
                        >
                          {item.title}
                        </Text>
                        {!!item.description && (
                          <Text style={styles.categoryDescription}>{item.description}</Text>
                        )}
                      </View>
                      <Image
                        source={isSelected ? icons.checkCircle : icons.circle}
                        style={styles.radioIcon}
                        resizeMode="contain"
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setAestheticsRoom(v => !v)}
            style={[styles.optionCard, aestheticsRoom && styles.optionCardSelected]}
          >
            <View style={styles.categoryRow}>
              <View style={styles.categoryTextCol}>
                <Text
                  style={[styles.categoryTitle, !aestheticsRoom && styles.categoryTitleUnselected]}
                >
                  Aesthetics Room
                </Text>
                <Text style={styles.categoryDescription}>
                  e.g. Botox, fillers, chemical peels, skin treatments
                </Text>
              </View>
              <Image
                source={aestheticsRoom ? icons.checkCircle : icons.circle}
                style={styles.radioIcon}
                resizeMode="contain"
              />
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cqcRow}>
              <Text style={styles.cqcText}>CQC Registered only</Text>
              <Switch
                value={cqcRegisteredOnly}
                onValueChange={setCqcRegisteredOnly}
                trackColor={{ false: colors.EBEBEB, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.contactBox}>
          <View style={styles.contactIconBadge}>
            <Text style={styles.contactIconText}>?</Text>
          </View>
          <View style={styles.contactTextCol}>
            <Text style={styles.contactTitle}>Not Sure Which Category Fits Your Space?</Text>
            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.contactLink}>Contact us</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Cancellation Policy</Text>
        <View style={styles.cancellationGrid}>
          {CANCELLATION_OPTIONS.map(option => {
            const isSelected = cancellationPolicy === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                activeOpacity={0.85}
                onPress={() => setCancellationPolicy(option.key)}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              >
                <View style={styles.categoryRow}>
                  <View style={styles.categoryTextCol}>
                    <Text style={styles.cancellationTitle}>{option.title}</Text>
                    {option.bullets.map(bullet => (
                      <Text key={bullet} style={styles.cancellationBullet}>
                        {option.bullets.length > 1 ? `•  ${bullet}` : bullet}
                      </Text>
                    ))}
                  </View>
                  <Image
                    source={isSelected ? icons.checkCircle : icons.circle}
                    style={styles.radioIcon}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter a title for your space"
          placeholderTextColor={colors.placeHolder}
          style={styles.input}
        />

        <Text style={styles.sectionLabel}>About this space</Text>
        <TextInput
          value={about}
          onChangeText={setAbout}
          placeholder="Describe your space"
          placeholderTextColor={colors.placeHolder}
          multiline
          textAlignVertical="top"
          style={styles.textArea}
        />

        <Text style={styles.sectionLabel}>Business Name</Text>
        <TextInput
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="Enter your business name"
          placeholderTextColor={colors.placeHolder}
          style={styles.input}
        />

        <Text style={styles.sectionLabel}>Address Number & Street</Text>
        <GooglePlaceField
          value={addressStreet}
          placeholder="Search your address"
          onSelect={result => {
            setAddressStreet(result.streetAddress || result.formattedAddress);
            if (result.areaTown) setAreaTown(result.areaTown);
            if (result.postCode) setPostCode(result.postCode);
            setLatitude(result.latitude);
            setLongitude(result.longitude);
          }}
        />

        <Text style={styles.sectionLabel}>Area / Town</Text>
        <TextInput
          value={areaTown}
          onChangeText={setAreaTown}
          placeholder="Enter area or town"
          placeholderTextColor={colors.placeHolder}
          style={styles.input}
        />

        <Text style={styles.sectionLabel}>Post Code</Text>
        <TextInput
          value={postCode}
          onChangeText={setPostCode}
          placeholder="Enter post code"
          placeholderTextColor={colors.placeHolder}
          autoCapitalize="characters"
          style={styles.input}
        />

        <Text style={styles.sectionLabel}>Minimum Booking Length (days)</Text>
        <TextInput
          value={minBookingLength}
          onChangeText={handleMinBookingChange}
          placeholder="e.g. 7"
          placeholderTextColor={colors.placeHolder}
          keyboardType="numeric"
          style={[styles.input, !!minBookingError && styles.inputError]}
        />
        {!!minBookingError && (
          <Text style={styles.errorText}>{minBookingError}</Text>
        )}

        <Text style={styles.sectionLabel}>Amenities</Text>
        <View style={styles.amenityGrid}>
          {DEFAULT_AMENITIES.map(item => {
            const isSelected = selectedAmenities.includes(item);
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.85}
                onPress={() => toggleAmenity(item)}
                style={[styles.amenityChip, isSelected && styles.amenityChipSelected]}
              >
                <Text style={styles.amenityText}>{item}</Text>
                <Image
                  source={isSelected ? icons.checkCircle : icons.circle}
                  style={styles.radioIconSmall}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            );
          })}
          {/* <TouchableOpacity activeOpacity={0.85} style={styles.addNewChip} onPress={handleAddAmenity}>
            <Text style={styles.addNewChipText}>Add New</Text>
          </TouchableOpacity> */}
        </View>

        <Text style={styles.sectionLabel}>What's Included</Text>
        <View style={styles.includedRow}>
          <TextInput
            value={includedInput}
            onChangeText={setIncludedInput}
            placeholder="e.g. Shampoo"
            placeholderTextColor={colors.placeHolder}
            style={[styles.input, styles.includedInput]}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.includedAddButton}
            onPress={handleAddIncludedItem}
          >
            <Image source={icons.add} style={styles.includedAddIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>
        {includedItems.length > 0 && (
          <View style={styles.includedTagRow}>
            {includedItems.map(item => (
              <View key={item} style={styles.includedTag}>
                <Text style={styles.includedTagText}>{item}</Text>
                <TouchableOpacity activeOpacity={0.8} onPress={() => removeIncludedItem(item)}>
                  <CloseIcon size={12} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.bigSectionTitle}>Pricing</Text>
        <View style={styles.pricingGrid}>
          <PricingField
            label="Hourly Pricing"
            value={hourlyPrice}
            onChangeText={setHourlyPrice}
            enabled={hourlyEnabled}
            onToggle={setHourlyEnabled}
          />
          <PricingField
            label="Daily Pricing"
            value={dailyPrice}
            onChangeText={setDailyPrice}
            enabled={dailyEnabled}
            onToggle={setDailyEnabled}
          />
          <PricingField
            label="Weekly Pricing"
            value={weeklyPrice}
            onChangeText={setWeeklyPrice}
            enabled={weeklyEnabled}
            // onToggle={setWeeklyEnabled}
            onToggle={(value) => {
              setWeeklyEnabled(value);
              const requiredMin = getRequiredMinBookingDays(value, weeklyEnabled);
              const numeric = parseInt(minBookingLength, 10);
              if (!isNaN(numeric) && numeric < requiredMin) {
                setMinBookingError(`Minimum booking must be at least ${requiredMin} days`);
              } else {
                setMinBookingError('');
              }
            }}
          />
          <PricingField
            label="Monthly Pricing"
            value={monthlyPrice}
            onChangeText={setMonthlyPrice}
            enabled={monthlyEnabled}
            // onToggle={setMonthlyEnabled}
            onToggle={(value) => {
              setMonthlyEnabled(value);
              const requiredMin = getRequiredMinBookingDays(value, monthlyEnabled);
              const numeric = parseInt(minBookingLength, 10);
              if (!isNaN(numeric) && numeric < requiredMin) {
                setMinBookingError(`Minimum booking must be at least ${requiredMin} days`);
              } else {
                setMinBookingError('');
              }
            }}
          />
        </View>
        {dailyEnabled && (
          <View style={styles.dayPickerSection}>
            <Text style={styles.sectionLabel}>Available Days</Text>
            <View style={styles.dayPickerRow}>
              {DAYS_OF_WEEK.map(day => {
                const isSelected = availableDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    activeOpacity={0.85}
                    onPress={() => toggleDay(day)}
                    style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                  >
                    <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
        <Text style={styles.bigSectionTitle}>Availability</Text>
        <View style={styles.dateRow}>
          <View style={styles.pricingField}>
            <Text style={styles.sectionLabel}>Start Date</Text>
            <DateField value={startDate} onChange={setStartDate} placeholder="Select start date" />
          </View>
          <View style={styles.pricingField}>
            <Text style={styles.sectionLabel}>End Date</Text>
            <DateField value={endDate} onChange={setEndDate} placeholder="Select end date" />
          </View>
        </View>

        <View style={styles.instantBookingRow}>
          <Text style={styles.instantBookingLabel}>Instant Booking</Text>
          <Switch
            value={instantBooking}
            onValueChange={setInstantBooking}
            trackColor={{ false: colors.EBEBEB, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.termsRow}
          onPress={() => setAgreeTerms(v => !v)}
        >
          {agreeTerms ? (
            <Image source={icons.checkBox} style={styles.termsCheckbox} resizeMode="contain" />
          ) : (
            <View style={styles.termsCheckboxEmpty} />
          )}
          <Text style={styles.termsText}>
            I agree to Slottley's <Text style={styles.termsLink}>Terms & Conditions</Text> and
            confirm that the information provided is accurate
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Add Place"
          onPress={handleAddPlace}
          loader={submitting}
          disable={submitting}
        />
      </View>
    </SafeAreaView>
  );
};

export default AddNewPlaceScreen;

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
  },
  scrollContent: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(24),
  },
  sectionLabel: {
    marginTop: hp(20),
    marginBottom: hp(10),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  bigSectionTitle: {
    marginTop: hp(28),
    marginBottom: hp(4),
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato700,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(12),
  },
  photoSlot: {
    width: '30%',
    aspectRatio: 0.85,
    borderRadius: wp(12),
    backgroundColor: colors.sage,
    borderWidth: 1,
    borderColor: colors.primary20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(8),
    position: 'relative',
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoRemoveBadge: {
    position: 'absolute',
    top: wp(6),
    right: wp(6),
    width: wp(22),
    height: wp(22),
    borderRadius: wp(11),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  photoPlusCircle: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(10),
  },
  photoPlusText: {
    color: colors.primary,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato400,
    marginTop: -2,
  },
  photoAddButton: {
    paddingHorizontal: wp(20),
    paddingVertical: hp(7),
    borderRadius: wp(20),
    backgroundColor: colors.primary,
  },
  photoAddButtonText: {
    color: colors.white,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato700,
  },
  photoCaption: {
    marginTop: hp(8),
    textAlign: 'center',
    color: colors.darkGray,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400Italic,
    fontStyle: 'italic',
  },
  categoryGrid: {
    gap: wp(10),
  },
  categoryRowWrap: {
    flexDirection: 'row',
    gap: wp(10),
  },
  optionCard: {
    flex: 1,
    borderRadius: wp(14),
    padding: wp(14),
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
  },
  optionCardSelected: {
    backgroundColor: colors.primary10,
    borderColor: colors.primary90,
  },
  optionCardCentered: {
    justifyContent: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  categoryTextColCentered: {
    alignItems: 'center',
  },
  categoryTextCol: {
    flex: 1,
    paddingRight: wp(8),
  },
  categoryTitle: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  categoryTitleCentered: {
    width: '100%',
    textAlign: 'center',
  },
  categoryTitleUnselected: {
    color: colors.gray606060,
  },
  categoryDescription: {
    marginTop: hp(4),
    color: colors.darkGray,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  radioIcon: {
    width: wp(22),
    height: wp(22),
  },
  radioIconSmall: {
    width: wp(18),
    height: wp(18),
  },
  cardDivider: {
    height: 1,
    marginVertical: hp(12),
    backgroundColor: colors.primaryLight,
  },
  cqcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cqcText: {
    color: colors.black,
    fontSize: fontSize(13),
    fontFamily: fonts.Lato400Italic,
    fontStyle: 'italic',
  },
  contactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(16),
    padding: wp(16),
    borderRadius: wp(14),
    backgroundColor: colors.primaryLight,
  },
  contactIconBadge: {
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(14),
  },
  contactIconText: {
    color: colors.white,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  contactTextCol: {
    flex: 1,
  },
  contactTitle: {
    color: colors.darkGray,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  contactLink: {
    marginTop: hp(4),
    color: colors.primary,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
    textDecorationLine: 'underline',
  },
  cancellationGrid: {
    gap: wp(10),
  },
  cancellationTitle: {
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato600,
  },
  cancellationBullet: {
    marginTop: hp(4),
    color: colors.darkGray,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  input: {
    height: hp(54),
    paddingHorizontal: wp(16),
    borderRadius: wp(12),
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  inputDisabled: {
    backgroundColor: colors.EBEBEB,
    borderColor: colors.EBEBEB,
    color: colors.subText,
  },
  textArea: {
    height: hp(100),
    paddingHorizontal: wp(16),
    paddingTop: hp(14),
    borderRadius: wp(14),
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(10),
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(10),
    paddingVertical: hp(12),
    paddingHorizontal: wp(14),
    borderRadius: wp(12),
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
  },
  amenityChipSelected: {
    backgroundColor: colors.primary10,
    borderColor: colors.primary90,
  },
  amenityText: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  addNewChip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(12),
    paddingHorizontal: wp(18),
    borderRadius: wp(14),
    backgroundColor: colors.primary10,
    borderWidth: 1,
    borderColor: colors.primary90,
  },
  addNewChipText: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  includedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  includedInput: {
    flex: 1,
  },
  includedAddButton: {
    width: wp(54),
    height: wp(54),
    borderRadius: wp(14),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  includedAddIcon: {
    width: wp(22),
    height: wp(22),
    tintColor: colors.white,
  },
  includedTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(10),
    marginTop: hp(12),
  },
  includedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    paddingVertical: hp(9),
    paddingHorizontal: wp(14),
    borderRadius: wp(12),
    backgroundColor: colors.primary10,
    borderWidth: 1,
    borderColor: colors.primary90,
  },
  includedTagText: {
    color: colors.black,
    fontSize: fontSize(13.5),
    fontFamily: fonts.Lato500,
  },
  pricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(14),
  },
  pricingField: {
    width: '47%',
  },
  pricingFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(20),
    marginBottom: hp(10),
  },
  pricingFieldLabel: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  dateRow: {
    flexDirection: 'row',
    gap: wp(14),
  },
  instantBookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(24),
  },
  instantBookingLabel: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500Italic,
    fontStyle: 'italic',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: hp(20),
  },
  termsCheckbox: {
    width: wp(24),
    height: wp(24),
    marginRight: wp(12),
  },
  termsCheckboxEmpty: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(6),
    borderWidth: 1.5,
    borderColor: colors.EBEBEB,
    marginRight: wp(12),
  },
  termsText: {
    flex: 1,
    color: colors.black,
    fontSize: fontSize(14),
    lineHeight: fontSize(19),
    fontFamily: fonts.Lato600,
  },
  termsLink: {
    color: colors.primary,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(16),
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    marginTop: hp(6),
    color: 'red',
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400,
  },
  dayPickerSection: { marginTop: hp(16) },
  dayPickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(8) },
  dayChip: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
  },
  dayChipSelected: {
    backgroundColor: colors.primary10,
    borderColor: colors.primary90,
  },
  dayChipText: { color: colors.gray606060, fontSize: fontSize(13), fontFamily: fonts.Lato500 },
  dayChipTextSelected: { color: colors.primary, fontFamily: fonts.Lato700 },
});
