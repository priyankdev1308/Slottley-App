import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';

import CustomButton from '../components/CustomButton';
import GooglePlaceField from '../components/GooglePlaceField';
import ToastAlert from '../components/ToastAlert';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, isIos, wp } from '../helpers/responsive';
import { supabase } from '../api/supabaseClient';
import { EditProfileScreenProps } from '../interface/screenTypes';

const PROFILE_IMAGE_BUCKET = 'profile_images';

const EditProfileScreen = ({ navigation }: EditProfileScreenProps) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [surName, setSurName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [profileImagePath, setProfileImagePath] = useState<string | null>(null);
  const [pendingAsset, setPendingAsset] = useState<Asset | null>(null);
  const [avatarPreviewLoading, setAvatarPreviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('first_name, sur_name, location, latitude, longitude, profile_image')
        .eq('id', authData.user.id)
        .single();

      if (cancelled) return;

      setUserId(authData.user.id);
      setEmail(authData.user.email ?? '');

      if (!error && data) {
        setFirstName(data.first_name ?? '');
        setSurName(data.sur_name ?? '');
        setLocation(data.location ?? '');
        setLatitude(data.latitude ?? null);
        setLongitude(data.longitude ?? null);
        setProfileImagePath(data.profile_image ?? null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const avatarUrl = useMemo(() => {
    if (!profileImagePath) return null;
    return supabase.storage.from(PROFILE_IMAGE_BUCKET).getPublicUrl(profileImagePath).data
      .publicUrl;
  }, [profileImagePath]);

  // Uploads the given asset to storage and returns its path — does not
  // touch the `users` row; the caller persists the path alongside the rest
  // of the form so a photo pick only takes effect once Save Changes runs.
  const uploadAvatar = async (asset: Asset): Promise<string | null> => {
    if (!userId || !asset.uri) return null;

    const response = await fetch(asset.uri);
    const arrayBuffer = await response.arrayBuffer();
    const ext =
      asset.fileName?.split('.').pop()?.toLowerCase() ||
      asset.uri.split('.').pop()?.toLowerCase() ||
      'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(PROFILE_IMAGE_BUCKET)
      .upload(path, arrayBuffer, {
        contentType: asset.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      ToastAlert({ title: 'Upload failed', description: uploadError.message });
      return null;
    }

    return path;
  };

  const handlePick = (source: 'camera' | 'library') => {
    const pickerFn = source === 'camera' ? launchCamera : launchImageLibrary;
    pickerFn({ mediaType: 'photo', quality: 0.8 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        ToastAlert({
          title: 'Could not open picker',
          description: response.errorMessage || response.errorCode,
        });
        return;
      }
      const asset = response.assets?.[0];
      if (asset) {
        setAvatarPreviewLoading(true);
        setPendingAsset(asset);
      }
    });
  };

  const handleAvatarPress = () => {
    Alert.alert('Update Profile Photo', undefined, [
      { text: 'Take Photo', onPress: () => handlePick('camera') },
      { text: 'Choose from Library', onPress: () => handlePick('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!userId) return;
    if (!firstName.trim()) {
      ToastAlert({ title: 'First name required', description: 'Please enter your first name.' });
      return;
    }

    setSaving(true);

    let profileImage = profileImagePath;
    if (pendingAsset) {
      const uploadedPath = await uploadAvatar(pendingAsset);
      if (!uploadedPath) {
        setSaving(false);
        return;
      }
      profileImage = uploadedPath;
    }

    const { error } = await supabase
      .from('users')
      .update({
        first_name: firstName.trim(),
        sur_name: surName.trim() || null,
        location: location.trim() || null,
        latitude,
        longitude,
        profile_image: profileImage,
      })
      .eq('id', userId);
    setSaving(false);

    if (error) {
      ToastAlert({ title: 'Could not save changes', description: error.message });
      return;
    }

    setProfileImagePath(profileImage);
    setPendingAsset(null);
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={isIos ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarCard}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.avatarWrap}
              onPress={handleAvatarPress}
            >
              <Image
                source={
                  pendingAsset?.uri
                    ? { uri: pendingAsset.uri }
                    : avatarUrl
                      ? { uri: avatarUrl }
                      : icons.tabProfile
                }
                style={pendingAsset?.uri || avatarUrl ? styles.avatarPhoto : styles.avatarIcon}
                resizeMode={pendingAsset?.uri || avatarUrl ? 'cover' : 'contain'}
                onLoadEnd={() => setAvatarPreviewLoading(false)}
                onError={() => setAvatarPreviewLoading(false)}
              />
              {(avatarPreviewLoading || (saving && pendingAsset)) && (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator size="small" color={colors.white} />
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Image
                  source={icons.camera}
                  style={styles.cameraIcon}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.nameRow}>
            <View style={styles.halfField}>
              <Text style={styles.sectionLabel}>First Name</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={colors.placeHolder}
                maxLength={25}
                style={styles.input}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.sectionLabel}>Surname</Text>
              <TextInput
                value={surName}
                onChangeText={setSurName}
                placeholder="Surname"
                placeholderTextColor={colors.placeHolder}
                maxLength={25}
                style={styles.input}
              />
            </View>
          </View>

          <Text style={styles.sectionLabel}>Email</Text>
          <TextInput
            value={email}
            editable={false}
            placeholder="Enter your email"
            placeholderTextColor={colors.placeHolder}
            keyboardType="email-address"
            style={[styles.input, styles.inputDisabled]}
          />

          <Text style={styles.sectionLabel}>Location</Text>
          <GooglePlaceField
            value={location}
            onSelect={result => {
              setLocation(result.formattedAddress);
              setLatitude(result.latitude);
              setLongitude(result.longitude);
            }}
            placeholder="Search your address"
          />
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            title="Save Changes"
            onPress={handleSave}
            loader={saving}
            disable={saving || loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

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
    paddingTop: hp(20),
    paddingBottom: hp(20),
  },
  avatarCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(30),
    borderRadius: wp(16),
    backgroundColor: colors.mintBg,
    borderWidth: 1,
    borderColor: '#15352933'
  },
  avatarWrap: {
    width: wp(120),
    height: wp(120),
  },
  avatarIcon: {
    width: '100%',
    height: '100%',
    borderRadius: wp(60),
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.lightGrayF5F5F5,
    tintColor: colors.primary,
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: wp(60),
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: wp(60),
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.mintBg,
  },
  cameraIcon: {
    width: wp(16),
    height: wp(16),
  },
  sectionLabel: {
    marginTop: hp(20),
    marginBottom: hp(10),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  nameRow: {
    flexDirection: 'row',
    gap: wp(12),
  },
  halfField: {
    flex: 1,
  },
  input: {
    height: hp(54),
    paddingHorizontal: wp(16),
    borderRadius: wp(14),
    backgroundColor: '#364C7108',
    borderWidth: 1,
    borderColor: '#364C710F',
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  inputDisabled: {
    backgroundColor: colors.EBEBEB,
    borderColor: colors.EBEBEB,
    color: colors.subText,
  },
  footer: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(16),
  },
});
