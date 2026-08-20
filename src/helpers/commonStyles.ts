import { StyleSheet } from 'react-native';

import { fonts } from '../utils/fonts';
import { colors } from '../utils/colors';
import { fontSize, wp } from './responsive';

export const cStyle = StyleSheet.create({
  flexCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  root: {
    flex: 1,
    paddingHorizontal: wp(20),
  },
  container: {
    flex: 1,
  },
  subContainer: {
    flex: 1,
    alignItems: 'center',
  },
  subContainer1: {
    flex: 1,
    justifyContent: 'center',
  },
  flexRowOnly: {
    flexDirection: 'row',
  },
  flexRowCenter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  flexRowJustify: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon12: {
    width: wp(12),
    height: wp(12),
    resizeMode: 'contain',
  },
  icon20: {
    width: wp(20),
    height: wp(20),
    resizeMode: 'contain',
  },
  icon15: {
    width: wp(15),
    height: wp(15),
    resizeMode: 'contain',
  },
  icon16: {
    width: wp(16),
    height: wp(16),
    resizeMode: 'contain',
  },
  icon18: {
    width: wp(18),
    height: wp(18),
    resizeMode: 'contain',
  },
  icon24: {
    width: wp(24),
    height: wp(24),
    resizeMode: 'contain',
  },
  icon28: {
    width: wp(28),
    height: wp(28),
    resizeMode: 'contain',
  },
  icon32: {
    width: wp(32),
    height: wp(32),
  },
  icon36: {
    width: wp(36),
    height: wp(36),
    resizeMode: 'contain',
  },
  icon40: {
    width: wp(40),
    height: wp(40),
    resizeMode: 'contain',
  },
  icon64: {
    width: wp(64),
    height: wp(64),
    resizeMode: 'contain',
  },
  icon73: {
    width: wp(73),
    height: wp(73),
  },
  textW70032White: {
    textAlign: 'center',
    color: colors.white,
    fontSize: fontSize(30),
    fontFamily: fonts.Lato700,
  },
  textW60012yellow: {
    textAlign: 'center',
    color: colors.yellow,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400,
  },
  textW60016white: {
    // textAlign: 'center',
    color: colors.white,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato400,
  },
  textW60012black: {
    // textAlign: 'center',
    color: colors.black,
    fontSize: fontSize(11),
    fontFamily: fonts.Lato400,
  },
  textW60011black: {
    // textAlign: 'center',
    color: colors.black,
    fontSize: fontSize(11),
    fontFamily: fonts.Lato400,
  },
  textW60010black: {
    // textAlign: 'center',
    color: colors.black,
    fontSize: fontSize(10),
    fontFamily: fonts.Lato400,
  },
  textW70018white: {
    // textAlign: 'center',
    color: colors.white,
    fontSize: fontSize(18),
    fontFamily: fonts.Lato700,
  },
  textW50014white: {
    // textAlign: 'center',
    color: colors.white,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  textW40012subText: {
    // textAlign: 'center',
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400,
  },
  textW40012white: {
    // textAlign: 'center',
    color: colors.white,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400,
  },
  textW60012subText: {
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400,
  },
  textW60010subText: {
    color: colors.subText,
    fontSize: fontSize(10),
    fontFamily: fonts.Lato400,
  },
  textW50012white: {
    textAlign: 'center',
    color: colors.white,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400,
  },
  textW50011white: {
    textAlign: 'center',
    color: colors.white,
    fontSize: fontSize(11),
    fontFamily: fonts.Lato400,
  },
  textW50012lightGreyText: {
    textAlign: 'center',
    color: colors.lightGreyText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400,
  },
  textW50012darkGrayText: {
    // textAlign: 'center',
    fontSize: fontSize(12),
    color: colors.darkGrayText,
    fontFamily: fonts.Lato400,
  },
  textW50014lightGrayText: {
    // textAlign: 'center',
    fontSize: fontSize(14),
    color: colors.lightGrayText,
    fontFamily: fonts.Lato400,
  },
  textW50012green: {
    textAlign: 'center',
    color: colors.green,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400,
  },
  textW50014green: {
    textAlign: 'center',
    color: colors.green,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  textW50014lightText: {
    color: colors.lightText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  textW50012lightText: {
    color: colors.lightText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400,
  },
  textW50010lightText: {
    textAlign: 'center',
    color: colors.lightText,
    fontSize: fontSize(10),
    fontFamily: fonts.Lato400,
  },
  textW70012white: {
    color: colors.white,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato700,
  },
  textW70014Yellow: {
    textAlign: 'center',
    color: colors.yellow,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  textW70022White: {
    color: colors.white,
    fontSize: fontSize(16.5),
    fontFamily: fonts.Lato700,
  },
  textW70021White: {
    color: colors.white,
    fontSize: fontSize(21),
    fontFamily: fonts.Lato700,
  },
  textW70016White: {
    color: colors.white,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  textW70020White: {
    color: colors.white,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato700,
  },
  textW70014red: {
    color: colors.red,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  textW60014red: {
    color: colors.red,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  textW70022: {
    color: colors.white,
    fontSize: fontSize(22),
    fontFamily: fonts.Lato700,
  },
  textW70016Yellow: {
    textAlign: 'center',
    color: colors.yellow,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  textW70016YellowM: {
    textAlign: 'center',
    color: colors.yellow,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  textW70016whiteP: {
    textAlign: 'center',
    color: colors.white,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  textW60014Grey: {
    color: colors.grey,
    textAlign: 'center',
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  textW60014white: {
    color: colors.white,
    textAlign: 'center',
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  textW60013yellow: {
    color: colors.yellow,
    textAlign: 'center',
    fontSize: fontSize(13),
    fontFamily: fonts.Lato400,
  },
  textW60014whiteM: {
    color: colors.white,
    textAlign: 'center',
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  textW50014White: {
    color: colors.white,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  textW70014White: {
    color: colors.white,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  textW70024Blue: {
    color: colors.blue,
    fontSize: fontSize(24),
    fontFamily: fonts.Lato700,
  },
  textW70020Blue: {
    color: colors.blue,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato700,
  },
  textW50014LightGray: {
    fontSize: fontSize(14),
    color: colors.lightGray,
    fontFamily: fonts.Lato400,
  },
});
