import React from 'react';
import { Image } from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';

import { icons } from '../../../assets/icons';
import type { SavedCard } from '../../interface/common';

interface IconProps {
  size?: number;
  color?: string;
}

const CARD_BRAND_SOURCE: Record<SavedCard['brand'], number> = {
  visa: icons.cardVisa,
  mastercard: icons.cardMastercard,
  amex: icons.cardAmex,
  discover: icons.cardDiscover,
  diners: icons.cardDiners,
  jcb: icons.cardJcb,
  unionpay: icons.cardUnionpay,
  unknown: icons.cardOther,
};

// Single lookup used by both MyCardsScreen and AddNewCardScreen so every
// brand Stripe can return gets its real logo instead of a hand-drawn stand-in.
export const getCardBrandIcon = (brand: SavedCard['brand'], size = 28) => (
  <Image
    source={CARD_BRAND_SOURCE[brand]}
    style={{ width: size, height: size * 0.64 }}
    resizeMode="contain"
  />
);

// e.g. (5, 2028) -> "05/28".
export const formatExpiry = (expMonth: number, expYear: number) =>
  `${String(expMonth).padStart(2, '0')}/${String(expYear).slice(-2)}`;

// BIN-prefix brand detection for the live icon shown while typing a card
// number — cosmetic only, Stripe's own `card.brand` (from its API response)
// is still the source of truth for what actually gets saved.
export const detectCardBrand = (digits: string): SavedCard['brand'] | null => {
  if (!digits) return null;
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2(2[2-9][1-9]|[3-6]\d\d|7[01]\d|720))/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^(6011|65|64[4-9]|622(1[2-9][6-9]|[2-8]\d\d|9[01]\d|92[0-5]))/.test(digits)) return 'discover';
  return null;
};

// Amex numbers are 15 digits grouped 4-6-5; everything else is 16 grouped 4-4-4-4.
export const formatCardNumber = (raw: string, brand: SavedCard['brand'] | null) => {
  const digits = raw.replace(/\D/g, '');
  if (brand === 'amex') {
    const truncated = digits.slice(0, 15);
    return truncated.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_m, a, b, c) =>
      [a, b, c].filter(Boolean).join(' '),
    );
  }
  const truncated = digits.slice(0, 16);
  return truncated.replace(/(.{4})/g, '$1 ').trim();
};

// Auto-inserts "/" after the month as the user types, e.g. "0529" -> "05/29".
export const formatExpiryInput = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export const PlusCircleIcon = ({ size = 20, color = '#153529' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
    <Line x1="12" y1="8" x2="12" y2="16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const TrashIcon = ({ size = 16, color = '#D00010' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0-.7 12.1a2 2 0 01-2 1.9H8.7a2 2 0 01-2-1.9L6 7h12z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="10" y1="11" x2="10" y2="16" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    <Line x1="14" y1="11" x2="14" y2="16" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

export const CloseIcon = ({ size = 16, color = '#153529' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="5" y1="5" x2="19" y2="19" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1="19" y1="5" x2="5" y2="19" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const EyeIcon = ({ size = 20, color = '#8A8A8E' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const EyeOffIcon = ({ size = 20, color = '#8A8A8E' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} />
    <Line x1="3" y1="21" x2="21" y2="3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);
