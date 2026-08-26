import React, { useState } from "react";
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
import { MainTabScreenProps } from "../navigation/TabNav";
import { colors } from "../utils/colors";
import { fonts } from "../utils/fonts";

type BookingRequest = {
  id: string;
  title: string;
  location: string;
  time: string;
  date: string;
  price: string;
  applicant: string;
  image: ImageSourcePropType;
};

const STATS = [
  {
    id: "total",
    value: "100",
    label: "TOTAL BOOKINGS",
    icon: icons.totalBooking,
  },
  {
    id: "upcoming",
    value: "05",
    label: "UPCOMING BOOKINGS",
    icon: icons.upcomingBookings,
  },
  {
    id: "occupancy",
    value: "78%",
    label: "OCCUPANCY RATE",
    icon: icons.occupancy,
  },
  {
    id: "earnings",
    value: "£4521",
    label: "TOTAL EARNINGS",
    icon: icons.totalEarning,
  },
];

// Mock data — replace with pending reservations returned for the signed-in host.
const INITIAL_REQUESTS: BookingRequest[] = [
  {
    id: "booking-1",
    title: "Hair Apprentice",
    location: "London, UK",
    time: "10:00 - 18:00",
    date: "Mon, 20 May 2026",
    price: "£120",
    applicant: "kenzi lawson",
    image: images.dummy3,
  },
  {
    id: "booking-2",
    title: "Premium Nail Desk",
    location: "London, UK",
    time: "12:00 - 18:00",
    date: "Mon, 22 May 2026",
    price: "£100",
    applicant: "John",
    image: images.dummy1,
  },
];

const DetailItem = ({
  icon,
  text,
  isLocation = false,
}: {
  icon: ImageSourcePropType;
  text: string;
  isLocation?: boolean;
}) => (
  <View style={styles.detailItem}>
    <Image
      source={icon}
      resizeMode="contain"
      style={[styles.metaIcon, isLocation && styles.locationIcon]}
    />
    <Text style={[styles.detailText, isLocation && styles.locationText]}>
      {text}
    </Text>
  </View>
);

const HostMyBookingScreen = ({ navigation }: MainTabScreenProps<"Booking">) => {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const updateRequest = (
    request: BookingRequest,
    action: "accept" | "reject"
  ) => {
    const isAccepting = action === "accept";
    Alert.alert(
      isAccepting ? "Accept booking" : "Reject booking",
      `Are you sure you want to ${action} ${request.applicant}'s booking request?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isAccepting ? "Accept" : "Reject",
          style: isAccepting ? "default" : "destructive",
          onPress: () =>
            setRequests((current) =>
              current.filter((item) => item.id !== request.id)
            ),
        },
      ]
    );
  };

  const openChat = (request: BookingRequest) => {
    navigation.navigate("ChatDetailScreen", {
      contactId: request.id,
      name: request.applicant,
    });
  };

  const openBookingDetail = (request: BookingRequest) => {
    navigation.navigate("HostBookingDetails", { bookingId: request.id });
  };

  return (
    <SafeAreaView style={styles.flex} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <Image
                source={stat.icon}
                resizeMode="contain"
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {requests.map((request) => (
          <TouchableOpacity
            key={request.id}
            activeOpacity={0.96}
            style={styles.bookingCard}
            onPress={() => openBookingDetail(request)}
          >
            <View style={styles.bookingTop}>
              <Image
                source={request.image}
                resizeMode="cover"
                style={styles.thumbnail}
              />
              <View style={styles.bookingTitleBlock}>
                <Text numberOfLines={1} style={styles.bookingTitle}>
                  {request.title}
                </Text>
                <View style={styles.locationRow}>
                  <DetailItem
                    icon={icons.mapPin}
                    text={request.location}
                    isLocation
                  />
                </View>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <DetailItem icon={icons.clock} text={request.time} />
              <DetailItem icon={icons.calendar} text={request.date} />
            </View>
            <View style={styles.priceRow}>
              <DetailItem icon={icons.money} text={request.price} />
            </View>

            <View style={styles.divider} />
            <Text style={styles.applicantLabel}>Applicant</Text>
            <View style={styles.applicantRow}>
              <View style={styles.avatar}>
                <Image
                  source={icons.tabProfile}
                  resizeMode="contain"
                  style={styles.avatarIcon}
                />
              </View>
              <Text style={styles.applicantName}>{request.applicant}</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                accessibilityLabel={`Message ${request.applicant}`}
                style={styles.chatButton}
                onPress={() => openChat(request)}
              >
                <Image
                  source={icons.chat}
                  resizeMode="contain"
                  style={styles.chatIcon}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => updateRequest(request, "reject")}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => updateRequest(request, "accept")}
              >
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {!requests.length && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No pending bookings</Text>
            <Text style={styles.emptyText}>
              New booking requests will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HostMyBookingScreen;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.screenBgColor },
  header: {
    alignItems: "center",
    paddingVertical: hp(14),
  },
  headerTitle: {
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
  },
  scrollContent: {
    paddingHorizontal: wp(18),
    paddingTop: hp(20),
    paddingBottom: hp(30),
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48.5%",
    minHeight: hp(130),
    marginBottom: hp(12),
    padding: wp(14),
    justifyContent: "flex-end",
    borderRadius: wp(8),
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  statIcon: {
    position: "absolute",
    top: hp(14),
    left: wp(14),
    width: wp(40),
    height: wp(40),
  },
  statValue: {
    color: colors.hostGold,
    fontSize: fontSize(24),
    fontFamily: fonts.Lato700,
  },
  statLabel: {
    marginTop: hp(4),
    color: colors.darkGray232323,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato700,
  },
  bookingCard: {
    marginTop: hp(20),
    borderRadius: wp(8),
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  bookingTop: {
    flexDirection: "row",
    paddingHorizontal: wp(14),
    paddingTop: hp(14),
  },
  thumbnail: {
    width: wp(60),
    height: wp(60),
    borderRadius: wp(9),
    marginRight: wp(12),
  },
  bookingTitleBlock: { flex: 1 },
  bookingTitle: {
    color: colors.darkGray232323,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato700,
  },
  detailItem: { flexDirection: "row", alignItems: "center" },
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
  locationRow: { marginTop: hp(6) },
  locationIcon: { marginRight: wp(6) },
  locationText: { color: colors.subText, fontSize: fontSize(12) },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: wp(20),
    rowGap: hp(12),
    paddingHorizontal: wp(14),
    marginTop: hp(14),
    marginBottom: hp(10),
  },
  priceRow: { paddingHorizontal: wp(14) },
  divider: { height: 1, marginTop: hp(19), backgroundColor: colors.lightWhite },
  applicantLabel: {
    marginHorizontal: wp(14),
    marginTop: hp(17),
    marginBottom: hp(9),
    color: colors.black,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato600,
  },
  applicantRow: {
    flexDirection: "row",
    alignItems: "center",
    height: hp(56),
    marginHorizontal: wp(14),
    paddingHorizontal: wp(9),
    borderWidth: 1,
    borderColor: colors.lightWhite,
    borderRadius: wp(10),
  },
  avatar: {
    width: wp(38),
    height: wp(38),
    borderRadius: wp(19),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.sage,
  },
  avatarIcon: { width: wp(21), height: wp(21), tintColor: colors.primary },
  applicantName: {
    flex: 1,
    marginLeft: wp(11),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato600,
  },
  chatButton: {
    width: wp(20),
    height: wp(20),
    alignItems: "center",
    justifyContent: "center",
  },
  chatIcon: { width: wp(20), height: wp(20), tintColor: colors.primary },
  actionRow: {
    flexDirection: "row",
    columnGap: wp(10),
    paddingHorizontal: wp(14),
    paddingTop: hp(20),
    paddingBottom: hp(18),
  },
  actionButton: {
    flex: 1,
    height: hp(50),
    borderWidth: 1.5,
    borderRadius: wp(28),
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: { borderColor: "#FFB8B8", backgroundColor: "#FFE8E8" },
  acceptButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  rejectText: {
    color: "#FF3B3B",
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  acceptText: {
    color: colors.primary,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  emptyState: { alignItems: "center", paddingVertical: hp(48) },
  emptyTitle: {
    color: colors.black,
    fontSize: fontSize(17),
    fontFamily: fonts.Lato700,
  },
  emptyText: {
    marginTop: hp(7),
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
});
