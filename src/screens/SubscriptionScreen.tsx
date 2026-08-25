import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "../../assets/icons";
import { fontSize, hp, wp } from "../helpers/responsive";
import { SubscriptionScreenProps } from "../interface/screenTypes";
import { colors } from "../utils/colors";
import { fonts } from "../utils/fonts";
import CustomButton from "../components/CustomButton";

type PlanId = "solo" | "enhance" | "pro";

type Plan = {
  id: PlanId;
  title: string;
  subtitle: string;
  commission: string;
  price: string;
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: "solo",
    title: "Solo",
    subtitle: "Perfect for getting started",
    commission: "15 % commission per booking",
    price: "Free",
    features: [
      "1 listing",
      "Up to 4 photos per listing",
      "Standard search visibility",
      "15% commission",
    ],
  },
  {
    id: "enhance",
    title: "Enhance",
    subtitle: "Perfect for growing hosts.",
    commission: "10 % commission per booking",
    price: "£19.99",
    features: [
      "Up to 3 listings",
      "Up to 10 photos per listing",
      "Enhanced visibility in search",
      "Bold, highlighted listing card",
      "10% commission",
    ],
  },
  {
    id: "pro",
    title: "Pro",
    subtitle: "Perfect for established hosts",
    commission: "7 % commission per booking",
    price: "£39.99",
    features: [
      "Unlimited listings",
      "Unlimited photos per listing",
      "Top search placement + featured badge",
      "Dynamic pricing suggestions",
      "7% commission",
    ],
  },
];

const SubscriptionScreen = ({ navigation }: SubscriptionScreenProps) => {
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>("solo");
  const selectedPlan =
    PLANS.find((plan) => plan.id === selectedPlanId) ?? PLANS[0];

  const subscribe = () => {
    Alert.alert(
      "Subscription selected",
      `${selectedPlan.title} has been selected for your subscription.`
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
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={icons.premium}
          resizeMode="contain"
          style={styles.crown}
        />

        <Text style={styles.upgradeTitle}>
          Upgrade to <Text style={styles.premiumWord}>Premium</Text>
        </Text>
        <Text style={styles.description}>
          Unlock full access to all features and insights
        </Text>

        <View style={styles.features}>
          {selectedPlan.features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Image
                source={icons.checkCircle}
                resizeMode="contain"
                style={styles.checkIcon}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          {PLANS.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            return (
              <TouchableOpacity
                key={plan.id}
                activeOpacity={0.85}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
                onPress={() => setSelectedPlanId(plan.id)}
              >
                <View style={styles.planTextBlock}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                  <Text style={styles.planSubtitle}>{plan.commission}</Text>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={styles.price}>{plan.price}</Text>
                  {plan.id !== "solo" && (
                    <Text style={styles.monthly}>/ monthly</Text>
                  )}
                </View>
                {isSelected && (
                  <View style={styles.selectedMark}>
                    <Image
                      source={icons.selectMark}
                      resizeMode="contain"
                      style={styles.selectedIcon}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <CustomButton
            title='Subscribe'
            onPress={() => navigation.goBack()}
          />
        </View>

        <Text style={styles.legalText}>
          This subscription auto-renews at the end of each month, unless
          cancelled 24-hours in advance. The fee is charged to your iTunes or
          Google Play account at confirmation of purchase. You may manage your
          subscriptions and turn off the auto-renewal by going to your Account
          Settings. No cancellation of the current subscription is allowed
          during active subscription period. Any unused portion of a free trial
          will be forfeited when you purchase a subscription to that
          publication. By joining you accept our{" "}
          <Text style={styles.legalLink}>Terms of Use</Text> and{" "}
          <Text style={styles.legalLink}>Privacy Policy.</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubscriptionScreen;

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
    paddingHorizontal: wp(18),
    paddingTop: hp(0),
    paddingBottom: hp(28),
  },
  crown: { alignSelf: "center", width: wp(150), height: hp(150) },
  upgradeTitle: {
    marginTop: hp(0),
    color: colors.darkGray232323,
    textAlign: "center",
    fontSize: fontSize(24),
    fontFamily: fonts.Lato700,
  },
  premiumWord: { color: colors.primary },
  description: {
    marginTop: hp(12),
    color: colors.darkGray,
    textAlign: "center",
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  features: {
    alignSelf: "center",
    width: "82%",
    marginTop: hp(20),
    rowGap: hp(18),
  },
  featureRow: { flexDirection: "row", alignItems: "center" },
  checkIcon: {
    width: wp(24),
    height: wp(24),
    marginRight: wp(14),
  },
  featureText: {
    flex: 1,
    color: colors.darkGray,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  plans: { marginTop: hp(30), rowGap: hp(12) },
  planCard: {
    height: hp(95),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(14),
    borderWidth: 1,
    borderColor: colors.lightWhite,
    borderRadius: wp(12),
    backgroundColor: "#F9F9F9",
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary10,
  },
  planTextBlock: { flex: 1 },
  planTitle: {
    color: colors.darkGray232323,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato700,
  },
  planSubtitle: {
    marginTop: hp(4),
    color: colors.darkGray,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  priceBlock: {
    flexDirection: "row",
    alignItems: "baseline",
    marginLeft: wp(8),
  },
  price: {
    color: "#000000",
    fontSize: fontSize(20),
    fontFamily: fonts.Lato700,
  },
  monthly: {
    color: "#000000",
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  selectedMark: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: wp(24),
    height: wp(24),
    borderTopLeftRadius: wp(10),
    borderBottomRightRadius: wp(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  selectedIcon: {
    width: wp(12),
    height: wp(10),
  },
  subscribeButton: {
    height: hp(55),
    marginTop: hp(38),
    borderRadius: wp(28),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  subscribeText: {
    color: colors.white,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato700,
  },
  legalText: {
    marginTop: hp(24),
    color: colors.subText,
    textAlign: "center",
    fontSize: fontSize(11),
    lineHeight: fontSize(16),
    fontFamily: fonts.Lato600,
  },
  legalLink: {
    color: colors.primary,
    fontSize: fontSize(11),
    fontFamily: fonts.Lato700,
    textDecorationLine: "underline",
  },
  footer: {
    paddingHorizontal: wp(0),
    paddingTop: hp(40),
    paddingBottom: hp(10),
  },
});
