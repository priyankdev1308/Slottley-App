import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';

type ScreenHeaderProps = {
  title: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
  rightIcon?: ImageSourcePropType;
  onRightPress?: () => void;
};

const ScreenHeader = ({
  title,
  onBackPress,
  showBackButton = true,
  rightContent,
  rightIcon,
  onRightPress,
}: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + hp(10) }]}>
      <View style={styles.side}>
        {showBackButton ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onBackPress}
            style={styles.iconButton}
          >
            <Image source={icons.back} style={styles.backIcon} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {title.toUpperCase()}
      </Text>

      <View style={[styles.side, styles.sideEnd]}>
        {rightContent ? (
          <View style={styles.rightContentWrap}>{rightContent}</View>
        ) : rightIcon ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onRightPress}
            style={styles.rightButton}
          >
            <Image source={rightIcon} style={styles.rightImage} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>
    </View>
  );
};

export default ScreenHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(12),
    backgroundColor: colors.white,
    paddingBottom: hp(20),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  side: {
    width: wp(54),
    alignItems: 'flex-start',
  },
  sideEnd: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    color: colors.D2D2D,
    textAlign: 'center',
    fontSize: fontSize(18),
    fontFamily: fonts.Lato700,
  },
  iconButton: {
    width: wp(38),
    height: wp(38),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(19),
  },
  backIcon: {
    width: wp(32),
    height: wp(32),
    resizeMode: 'contain',
    tintColor: colors.darkGray,
  },
  rightButton: {
    width: wp(38),
    height: wp(38),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(12),
    borderWidth: 1,
    borderColor: colors.EBEBEB,
    backgroundColor: colors.white,
  },
  rightImage: {
    width: wp(18),
    height: wp(18),
    resizeMode: 'contain',
  },
  rightContentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
