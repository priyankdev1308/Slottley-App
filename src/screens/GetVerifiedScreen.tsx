import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';

import CustomButton from '../components/CustomButton';
import ToastAlert from '../components/ToastAlert';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { headerShadow } from '../utils/shadows';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { supabase } from '../api/supabaseClient';
import { GetVerifiedScreenProps } from '../interface/screenTypes';

const VERIFICATION_BUCKET = 'verified_users';

type SlotKey = 'identity_images' | 'insurance_certificate';

interface VerificationRow {
  identity_images: string | null;
  insurance_certificate: string | null;
  is_verified: number;
}

interface UploadItem {
  key: SlotKey;
  title: string;
  description?: string;
}

const UPLOAD_ITEMS: UploadItem[] = [
  { key: 'identity_images', title: 'Photo ID (Passport or Driving Licence)' },
  {
    key: 'insurance_certificate',
    title: 'Liability Insurance Certificate',
    description:
      "Upload proof of current liability insurance (public liability and/or professional indemnity). You're responsible for ensuring your cover is appropriate for the services you offer.",
  },
];

const GetVerifiedScreen = ({ navigation }: GetVerifiedScreenProps) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removingSlot, setRemovingSlot] = useState<SlotKey | null>(null);

  const [verification, setVerification] = useState<VerificationRow | null>(null);
  const [existingUrls, setExistingUrls] = useState<Partial<Record<SlotKey, string>>>({});
  const [pendingAssets, setPendingAssets] = useState<Partial<Record<SlotKey, Asset>>>({});

  const loadSignedUrls = async (row: VerificationRow) => {
    const urls: Partial<Record<SlotKey, string>> = {};
    for (const item of UPLOAD_ITEMS) {
      const path = row[item.key];
      if (!path) continue;
      const { data: signed } = await supabase.storage
        .from(VERIFICATION_BUCKET)
        .createSignedUrl(path, 60 * 60);
      if (signed?.signedUrl) urls[item.key] = signed.signedUrl;
    }
    setExistingUrls(urls);
  };

  useEffect(() => {
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setLoading(false);
        return;
      }
      setUserId(authData.user.id);

      const { data } = await supabase
        .from('verified_users')
        .select('identity_images, insurance_certificate, is_verified')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (data) {
        setVerification(data);
        await loadSignedUrls(data);
      }

      setLoading(false);
    })();
  }, []);

  const isVerified = verification?.is_verified === 1;
  const isPending = verification?.is_verified === 0;
  const isRejected = verification?.is_verified === 2;
  const editable = !verification || isRejected;

  const handlePick = (slot: SlotKey, source: 'camera' | 'library') => {
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
      if (asset) setPendingAssets(prev => ({ ...prev, [slot]: asset }));
    });
  };

  const handleAddPress = (slot: SlotKey) => {
    Alert.alert('Upload Document', undefined, [
      { text: 'Take Photo', onPress: () => handlePick(slot, 'camera') },
      { text: 'Choose from Library', onPress: () => handlePick(slot, 'library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const clearLocalSlot = (slot: SlotKey) => {
    setPendingAssets(prev => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
    setExistingUrls(prev => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  };

  const handleRemove = async (slot: SlotKey) => {
    const existingPath = verification?.[slot];

    // Only a local pick that was never uploaded — nothing on the server to clean up.
    if (!existingPath) {
      clearLocalSlot(slot);
      return;
    }

    if (!userId) return;

    setRemovingSlot(slot);
    const { error: removeError } = await supabase.storage
      .from(VERIFICATION_BUCKET)
      .remove([existingPath]);

    if (removeError) {
      setRemovingSlot(null);
      ToastAlert({ title: 'Could not remove document', description: removeError.message });
      return;
    }

    const { error: updateError } = await supabase
      .from('verified_users')
      .update({ [slot]: null })
      .eq('user_id', userId);
    setRemovingSlot(null);

    if (updateError) {
      ToastAlert({ title: 'Could not update record', description: updateError.message });
      return;
    }

    setVerification(prev => (prev ? { ...prev, [slot]: null } : prev));
    clearLocalSlot(slot);
  };

  const uploadDoc = async (slot: SlotKey, asset: Asset): Promise<string | null> => {
    if (!userId || !asset.uri) return null;

    const response = await fetch(asset.uri);
    const arrayBuffer = await response.arrayBuffer();
    const ext =
      asset.fileName?.split('.').pop()?.toLowerCase() ||
      asset.uri.split('.').pop()?.toLowerCase() ||
      'jpg';
    const path = `${userId}/${slot}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(VERIFICATION_BUCKET)
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

  const handleSubmit = async () => {
    if (!userId) return;

    const hasIdentity = !!pendingAssets.identity_images || !!existingUrls.identity_images;
    const hasInsurance = !!pendingAssets.insurance_certificate || !!existingUrls.insurance_certificate;
    if (!hasIdentity || !hasInsurance) {
      ToastAlert({
        title: 'Both documents required',
        description: 'Please add your Photo ID and Liability Insurance Certificate.',
      });
      return;
    }

    setSubmitting(true);

    let identityPath = verification?.identity_images ?? null;
    if (pendingAssets.identity_images) {
      const uploaded = await uploadDoc('identity_images', pendingAssets.identity_images);
      if (!uploaded) {
        setSubmitting(false);
        return;
      }
      identityPath = uploaded;
    }

    let insurancePath = verification?.insurance_certificate ?? null;
    if (pendingAssets.insurance_certificate) {
      const uploaded = await uploadDoc('insurance_certificate', pendingAssets.insurance_certificate);
      if (!uploaded) {
        setSubmitting(false);
        return;
      }
      insurancePath = uploaded;
    }

    const submittedRow: VerificationRow = {
      identity_images: identityPath,
      insurance_certificate: insurancePath,
      is_verified: 0,
    };

    const { error } = await supabase
      .from('verified_users')
      .upsert({ user_id: userId, ...submittedRow }, { onConflict: 'user_id' });

    if (error) {
      setSubmitting(false);
      ToastAlert({ title: 'Could not submit', description: error.message });
      return;
    }

    await loadSignedUrls(submittedRow);
    setVerification(submittedRow);
    setPendingAssets({});
    setSubmitting(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.flex} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Get Verified</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isVerified ? (
          <View style={styles.verifiedCard}>
            <Image source={icons.verified} style={styles.verifiedIcon} resizeMode="contain" />
            <Text style={styles.verifiedTitle}>You're Verified</Text>
            <Text style={styles.verifiedText}>
              Your documents have been reviewed and approved.
            </Text>
          </View>
        ) : (
          <>
            {isRejected && (
              <View style={styles.rejectedBanner}>
                <Text style={styles.rejectedText}>
                  Your last submission was rejected. Please replace the documents below and
                  resubmit.
                </Text>
              </View>
            )}

            {UPLOAD_ITEMS.map(item => {
              const previewUri = pendingAssets[item.key]?.uri ?? existingUrls[item.key];

              return (
                <View key={item.key}>
                  <Text style={styles.sectionLabel}>{item.title}</Text>
                  {!!item.description && (
                    <Text style={styles.sectionDescription}>{item.description}</Text>
                  )}

                  <View style={[styles.uploadBox, !previewUri && styles.uploadBoxEmpty]}>
                    {previewUri ? (
                      <>
                        <Image
                          source={{ uri: previewUri }}
                          style={styles.previewImage}
                          resizeMode="cover"
                        />
                        {editable && (
                          <TouchableOpacity
                            activeOpacity={0.85}
                            style={styles.removeBadge}
                            disabled={removingSlot === item.key}
                            onPress={() => handleRemove(item.key)}
                          >
                            {removingSlot === item.key ? (
                              <ActivityIndicator size="small" color={colors.red} />
                            ) : (
                              <Text style={styles.removeBadgeText}>Remove</Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </>
                    ) : (
                      <>
                        <View style={styles.plusCircle}>
                          <Text style={styles.plusText}>+</Text>
                        </View>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={styles.addButton}
                          onPress={() => handleAddPress(item.key)}
                        >
                          <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {isPending ? (
        <View style={styles.footer}>
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingText}>Verification is pending</Text>
          </View>
        </View>
      ) : !isVerified ? (
        <View style={styles.footer}>
          <CustomButton
            title={isRejected ? 'Resubmit' : 'Verify'}
            onPress={handleSubmit}
            loader={submitting}
            disable={submitting}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default GetVerifiedScreen;

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
  },
  scrollContent: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(20),
  },
  sectionLabel: {
    marginTop: hp(20),
    marginBottom: hp(8),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  sectionDescription: {
    marginBottom: hp(12),
    color: colors.subText,
    fontSize: fontSize(12),
    fontStyle: 'italic',
    lineHeight: fontSize(17),
    fontFamily: fonts.Lato400,
  },
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(16),
    backgroundColor: colors.primary10,
    borderWidth: 1,
    borderColor: colors.primary20,
    overflow: 'hidden',
  },
  uploadBoxEmpty: {
    paddingVertical: hp(50),
  },
  plusCircle: {
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(16),
  },
  plusText: {
    color: colors.primary,
    fontSize: fontSize(22),
    fontFamily: fonts.Lato400,
    marginTop: -2,
  },
  addButton: {
    paddingHorizontal: wp(28),
    paddingVertical: hp(10),
    borderRadius: wp(24),
    backgroundColor: colors.primary,
  },
  addButtonText: {
    color: colors.white,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato700,
  },
  previewImage: {
    width: '100%',
    height: hp(180),
  },
  removeBadge: {
    position: 'absolute',
    right: wp(12),
    bottom: hp(12),
    paddingHorizontal: wp(14),
    paddingVertical: hp(8),
    borderRadius: wp(20),
    backgroundColor: colors.lightRed,
    borderWidth: 1,
    borderColor: colors.red80,
  },
  removeBadgeText: {
    color: colors.red,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato700,
  },
  rejectedBanner: {
    marginTop: hp(16),
    padding: wp(14),
    borderRadius: wp(12),
    backgroundColor: colors.lightRed,
    borderWidth: 1,
    borderColor: colors.red80,
  },
  rejectedText: {
    color: colors.red,
    fontSize: fontSize(13),
    lineHeight: fontSize(19),
    fontFamily: fonts.Lato500,
  },
  verifiedCard: {
    marginTop: hp(40),
    alignItems: 'center',
    padding: wp(24),
    borderRadius: wp(16),
    backgroundColor: colors.mintBg,
    borderWidth: 1,
    borderColor: colors.primary80,
  },
  verifiedIcon: {
    width: wp(56),
    height: wp(56),
    marginBottom: hp(16),
    tintColor: colors.primary,
  },
  verifiedTitle: {
    color: colors.black,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato700,
  },
  verifiedText: {
    marginTop: hp(8),
    color: colors.subText,
    fontSize: fontSize(13),
    textAlign: 'center',
    lineHeight: fontSize(19),
    fontFamily: fonts.Lato400,
  },
  footer: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(16),
  },
  pendingBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    height: hp(54),
    borderRadius: wp(14),
    backgroundColor: colors.primary10,
    borderWidth: 1,
    borderColor: colors.primary20,
  },
  pendingText: {
    color: colors.primary,
    fontSize: fontSize(14.5),
    fontFamily: fonts.Lato700,
  },
});
