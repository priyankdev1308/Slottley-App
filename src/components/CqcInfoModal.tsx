import React from 'react';
import { View, Text, Image, Modal, StyleSheet, TouchableOpacity } from 'react-native';

import { icons } from '../../assets/icons';
import { CloseIcon } from './icons/CardIcons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';

interface CqcInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

const CqcInfoModal = ({ visible, onClose }: CqcInfoModalProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.closeButton}>
          <CloseIcon size={16} color={colors.black} />
        </TouchableOpacity>

        <Image source={icons.info} style={styles.icon} resizeMode="contain" />

        <Text style={styles.title}>CQC Registered ✓</Text>
        <Text style={styles.description}>
          CQC registration status is self-declared by the host and verified by
          Slottley against the public register where indicated. Absence of
          this badge does not imply non-compliance. Practitioners are
          responsible for confirming a space meets requirements for their
          specific treatments.”
        </Text>
      </View>
    </View>
  </Modal>
);

export default CqcInfoModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: wp(24),
  },
  card: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: wp(20),
    borderWidth: 1,
    borderColor: colors.EBEBEB,
    padding: wp(24),
    paddingTop: hp(28),
  },
  closeButton: {
    position: 'absolute',
    top: hp(16),
    right: wp(16),
    width: wp(34),
    height: wp(34),
    borderRadius: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.EBEBEB,
  },
  icon: {
    width: wp(80),
    height: wp(80),
  },
  title: {
    marginTop: hp(18),
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato700,
  },
  description: {
    marginTop: hp(10),
    textAlign: 'center',
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato600,
    lineHeight: fontSize(20),
  },
});
