// Real App Store Connect / Google Play Console product ids are reverse-DNS
// strings tied to the app's bundle id — defined here under the same ids
// they'll be registered under later, so switching from test-mode to real
// StoreKit/Google Play Billing purchases never needs a rename.
export const SUBSCRIPTION_PRODUCT_IDS = {
  enhance: 'com.app.slottley.subscription.enhance.monthly',
  pro: 'com.app.slottley.subscription.pro.monthly',
} as const;

export type PaidPlanId = keyof typeof SUBSCRIPTION_PRODUCT_IDS;
export type PlanId = "solo" | PaidPlanId;

const PLAN_ID_BY_PRODUCT: Record<string, PaidPlanId> = Object.fromEntries(
  Object.entries(SUBSCRIPTION_PRODUCT_IDS).map(([planId, productId]) => [productId, planId as PaidPlanId])
);

// Maps a users row's subscription_product/is_subscription_activated to the
// Host's actual current plan — Solo (the free tier) whenever there's no
// active paid subscription or the stored product id isn't recognized.
export const resolvePlanId = (
  subscriptionProduct: string | null | undefined,
  isSubscriptionActivated: number | boolean | null | undefined
): PlanId => {
  if (!isSubscriptionActivated || !subscriptionProduct) return "solo";
  return PLAN_ID_BY_PRODUCT[subscriptionProduct] ?? "solo";
};

// How many space photos a Host on each plan may upload.
export const PLAN_PHOTO_LIMITS: Record<PlanId, number> = {
  solo: 4,
  enhance: 10,
  pro: 15,
};
