import {
  StyleProp,
  TextStyle,
  ViewStyle,
  ImageStyle,
  ImageSourcePropType,
  KeyboardTypeOptions,
} from "react-native";
import type { SpaceRole, MainTabParamList } from "../navigation/TabNav";

export interface SavedCard {
  id: string;
  brand: "visa" | "mastercard";
  last4: string;
  first4: string;
}

export type RootStackParamList = {
  SplashScreen: undefined;
  OnboardingScreen: undefined;
  LoginScreen: undefined;
  ForgotPasswordScreen: undefined;
  ResetPasswordScreen: undefined;
  FitnessInfoScreen: { startStep?: number } | undefined;
  EditProfileScreen: undefined;
  ChangePasswordScreen: undefined;
  PurchaseHistoryScreen:
    | {
        filters?: {
          dateFrom?: string;
          dateTo?: string;
          status?: string;
          sortBy?: string;
        };
      }
    | undefined;
  FilterScreen: undefined;
  PlaceDetailScreen: { spaceId?: string } | undefined;
  SpaceListScreen: { listType: "nearYou" | "featured" };
  BookPlaceScreen: { mode: "single" | "weekly" | "monthly"; spaceId?: string };
  RentAgreementScreen: undefined;
  PaymentScreen: undefined;
  BookingConfirmationScreen: undefined;
  JobDetailScreen: { jobId?: string } | undefined;
  JobApplyScreen: { jobId?: string } | undefined;
  HostJobRequestDetails: { requestId?: string } | undefined;
  HostBookingDetails: { bookingId?: string } | undefined;
  SubscriptionScreen: undefined;
  ChatDetailScreen: { contactId: string; name: string };
  WishlistScreen: undefined;
  MyJobApplicationsScreen: undefined;
  GetVerifiedScreen: undefined;
  ReferEarnScreen: undefined;
  MyCardsScreen: undefined;
  AddNewCardScreen: { onAdd: (card: SavedCard) => void };
  NotificationScreen: undefined;
  AddNewPlaceScreen: undefined;
  HostPlaceDetailScreen: { spaceId?: string } | undefined;
  AddNewJobScreen: { jobId?: string } | undefined;
  HostJobDetailScreen: { jobId?: string } | undefined;
  HostJobRequestScreen: undefined;
  HostPaymentScreen: { jobId?: string } | undefined;
  OrderDetailScreen: { saleId?: string } | undefined;
  TermsScreen: undefined;
  MainTabs:
    | { userRole?: SpaceRole; initialTab?: keyof MainTabParamList }
    | undefined;
  BreakfastDetailScreen: { mealType?: string; date?: string } | undefined;
  AddMealScreen:
    | {
        mealId?: number;
        food?: string;
        mealType?: string;
        imageUri?: string;
        calories?: number;
        protein?: number;
        carbs?: number;
        fats?: number;
      }
    | undefined;
  SearchFoodScreen: undefined;
  AddFitnessInfo: undefined;
  NutritionTargetScreen:
    | {
        dailyTarget?: {
          daily_target_id: number;
          user_id: number;
          daily_target_date: string;
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          fitness_goal: string;
          activitiy_name: string;
        };
        calorieCompletion?: {
          target_calories: number;
          consumed_calories: number;
          completion_percentage: number;
        };
      }
    | undefined;
  ChallengesScreen: undefined;
};

export interface TextInputProps {
  value: string;
  label?: string;
  error?: string;
  loading?: boolean;
  rightText?: string;
  maxLength?: number;
  onEndEditing?: any;
  editable?: boolean;
  autoComplete?: any;
  autoFocus?: boolean;
  multiline?: boolean;
  leftPrefix?: string;
  onFocus?: () => void;
  isLeftIcon?: boolean;
  placeholder?: string;
  textContentType?: any;
  isMandetory?: boolean;
  isRightText?: boolean;
  isRightIcon?: boolean;
  autoCorrect?: boolean;
  onBlur?: (e: any) => void;
  leftIconDisable?: boolean;
  secureTextEntry?: boolean;
  leftIconStyle?: ImageStyle;
  leftIconTintColor?: string;
  rightIconDisable?: boolean;
  rightIconTintColor?: string;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
  onRightTextPress?: () => void;
  onPressLeftPrefix?: () => void;
  keyboardType?: KeyboardTypeOptions;
  leftIconSource?: ImageSourcePropType;
  rightIconSource?: ImageSourcePropType;
  onChangeText?: (text: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  customLabelStyle?: StyleProp<TextStyle>;
  customInputStyle?: StyleProp<TextStyle>;
  customShadowStyle?: StyleProp<ViewStyle>;
  customTextBoxStyle?: StyleProp<ViewStyle>;
  autoCapitalize?: "none" | "sentences" | "words" | "characters" | undefined;
}

export interface CustomButtonProps {
  title: string;
  loader?: boolean;
  disable?: boolean;
  infoText?: string;
  isBottom?: boolean;
  onPress: () => void;
  iconSource?: ImageSourcePropType;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  buttonType?: "primary" | "secondary" | "outline";
}
