import React from "react";
import {
  Alert,
  Image,
  ImageSourcePropType,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "../../assets/icons";
import { images } from "../../assets/images";
import { fontSize, hp, wp } from "../helpers/responsive";
import { HostBookingDetailsScreenProps } from "../interface/screenTypes";
import { colors } from "../utils/colors";
import { fonts } from "../utils/fonts";

const BOOKING = {
  title: "Hair Apprentice",
  location: "London, UK",
  image: images.dummy3,
  applicant: {
    id: "kenzi-lawson",
    name: "kenzi lawson",
    role: "Hair Apprentice",
    location: "London — Shoreditch",
    time: "10:00 - 18:00",
    date: "15/12/2026",
    price: "£120",
    about:
      "A luxurious private beauty room perfect for hairstylists, beauticians, and wellness professionals. Modern setup with premium amenities in a prime location.",
  },
};

const MetaItem = ({
  icon,
  label,
}: {
  icon: ImageSourcePropType;
  label: string;
}) => (
  <View style={styles.metaItem}>
    <Image source={icon} resizeMode="contain" style={styles.metaIcon} />
    <Text style={styles.metaText}>{label}</Text>
  </View>
);

const HostBookingDetails = ({ navigation }: HostBookingDetailsScreenProps) => {
  const updateBooking = (action: "Accept" | "Reject") => {
    Alert.alert(
      `${action} booking`,
      `Are you sure you want to ${action.toLowerCase()} this booking request?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: action === "Reject" ? "destructive" : "default",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityLabel="Go back"
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={icons.back}
            resizeMode="contain"
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Detail</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bookingCard}>
          <Image
            source={BOOKING.image}
            resizeMode="cover"
            style={styles.bookingImage}
          />
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingTitle}>{BOOKING.title}</Text>
            <MetaItem icon={icons.mapPin} label={BOOKING.location} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Applicant</Text>
        <View style={styles.applicantCard}>
          <View style={styles.applicantHeader}>
            <View style={styles.avatar}>
              <Image
                source={icons.tabProfile}
                resizeMode="contain"
                style={styles.avatarIcon}
              />
            </View>
            <View style={styles.applicantIdentity}>
              <Text style={styles.applicantName}>{BOOKING.applicant.name}</Text>
              <Text style={styles.applicantRole}>{BOOKING.applicant.role}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityLabel="Message applicant"
              style={styles.chatButton}
              onPress={() =>
                navigation.navigate("ChatDetailScreen", {
                  contactId: BOOKING.applicant.id,
                  name: BOOKING.applicant.name,
                })
              }
            >
              <Image
                source={icons.chat}
                resizeMode="contain"
                style={styles.chatIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />
          <View style={styles.metaGrid}>
            <MetaItem icon={icons.mapPin} label={BOOKING.applicant.location} />
            <MetaItem icon={icons.clock} label={BOOKING.applicant.time} />
            <MetaItem icon={icons.calendar} label={BOOKING.applicant.date} />
            <MetaItem icon={icons.money} label={BOOKING.applicant.price} />
          </View>

          <View style={styles.divider} />
          <View style={styles.aboutBlock}>
            <Text style={styles.aboutTitle}>About Applicant</Text>
            <Text style={styles.aboutText}>{BOOKING.applicant.about}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => updateBooking("Accept")}
        >
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => updateBooking("Reject")}
        >
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HostBookingDetails;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.screenBgColor },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(20),
    paddingVertical: hp(14),
  },
  backButton: { width: wp(32), height: wp(32), justifyContent: "center" },
  backIcon: { width: wp(32), height: wp(32), tintColor: colors.primary },
  headerTitle: {
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
  },
  scrollContent: {
    paddingHorizontal: wp(20),
    paddingTop: hp(22),
    paddingBottom: hp(28),
  },
  bookingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(14),
    borderRadius: wp(8),
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 4,
  },
  bookingImage: {
    width: wp(60),
    height: wp(60),
    borderRadius: wp(6),
    marginRight: wp(13),
  },
  bookingInfo: { flex: 1 },
  bookingTitle: {
    marginBottom: hp(10),
    color: colors.darkGray232323,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato700,
  },
  metaItem: { flexDirection: "row", alignItems: "center", width: "50%" },
  metaIcon: {
    width: wp(14),
    height: wp(14),
    marginRight: wp(7),
    tintColor: colors.primary,
  },
  metaText: {
    flexShrink: 1,
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  sectionTitle: {
    marginTop: hp(25),
    marginBottom: hp(12),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato600,
  },
  applicantCard: {
    borderWidth: 1,
    borderColor: colors.lightWhite,
    borderRadius: wp(8),
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  applicantHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(14),
    paddingVertical: hp(14),
  },
  avatar: {
    width: wp(45),
    height: wp(45),
    borderRadius: wp(25),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.sage,
  },
  avatarIcon: { width: wp(27), height: wp(27), tintColor: colors.primary },
  applicantIdentity: { flex: 1, marginLeft: wp(12) },
  applicantName: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato600,
  },
  applicantRole: {
    marginTop: hp(4),
    color: colors.gray6E6E6E,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  chatButton: {
    width: wp(24),
    height: wp(24),
    alignItems: "center",
    justifyContent: "center",
  },
  chatIcon: { width: wp(24), height: wp(24), tintColor: colors.primary },
  divider: { height: 1, backgroundColor: colors.lightWhite },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: wp(18),
    paddingVertical: hp(17),
    rowGap: hp(18),
  },
  aboutBlock: {
    paddingHorizontal: wp(18),
    paddingTop: hp(17),
    paddingBottom: hp(20),
  },
  aboutTitle: {
    color: colors.primary,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato700,
  },
  aboutText: {
    marginTop: hp(10),
    color: colors.subText,
    fontSize: fontSize(12),
    lineHeight: fontSize(20),
    fontFamily: fonts.Lato400,
  },
  footer: {
    flexDirection: "row",
    columnGap: wp(10),
    paddingHorizontal: wp(20),
    paddingTop: hp(12),
    paddingBottom: hp(10),
    backgroundColor: colors.screenBgColor,
  },
  actionButton: {
    flex: 1,
    height: hp(50),
    borderWidth: 1.5,
    borderRadius: wp(28),
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  rejectButton: { borderColor: "#FFB8B8", backgroundColor: "#FFE8E8" },
  acceptText: {
    color: colors.primary,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  rejectText: {
    color: "#FF3B3B",
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
});
