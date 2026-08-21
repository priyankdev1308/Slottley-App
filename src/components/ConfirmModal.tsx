import React from 'react';
import { View, Text, Modal, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

import { CloseIcon } from './icons/CardIcons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  cancelText: string;
  confirmText: string;
  confirmLoading?: boolean;
}

const ConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  icon,
  iconBg,
  title,
  description,
  cancelText,
  confirmText,
  confirmLoading,
}: ConfirmModalProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.closeButton}>
          <CloseIcon size={16} color={colors.black} />
        </TouchableOpacity>

        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>{icon}</View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onClose}
            disabled={confirmLoading}
            style={[styles.cancelButton, confirmLoading && styles.disabled]}
          >
            <Text style={styles.cancelText}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onConfirm}
            disabled={confirmLoading}
            style={[styles.confirmButton, confirmLoading && styles.disabled]}
          >
            {confirmLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.confirmText}>{confirmText}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default ConfirmModal;

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
  iconCircle: {
    width: wp(80),
    height: wp(80),
    borderRadius: wp(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: hp(18),
    color: colors.black,
    fontSize: fontSize(22),
    fontFamily: fonts.Lato700,
  },
  description: {
    marginTop: hp(10),
    textAlign: 'center',
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
    lineHeight: fontSize(20),
  },
  buttonRow: {
    flexDirection: 'row',
    gap: wp(12),
    marginTop: hp(24),
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: hp(52),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(30),
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.EBEBEB,
  },
  cancelText: {
    color: colors.primary,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  confirmButton: {
    flex: 1,
    height: hp(52),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(30),
    backgroundColor: colors.primary,
  },
  confirmText: {
    color: colors.white,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato700,
  },
  disabled: {
    opacity: 0.6,
  },
});
