import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';

import { icons } from '../../assets/icons';
import { CloseIcon } from './icons/CardIcons';
import CustomButton from './CustomButton';
import ToastAlert from './ToastAlert';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp, isIos } from '../helpers/responsive';

interface AddReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => void;
}

const AddReviewModal = ({ visible, onClose, onSubmit }: AddReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');

  const handleClose = () => {
    setRating(0);
    setText('');
    onClose();
  };

  const handleSubmit = () => {
    if (rating === 0) {
      ToastAlert({ title: 'Add a rating', description: 'Please select a star rating.' });
      return;
    }
    onSubmit(rating, text.trim());
    setRating(0);
    setText('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={isIos ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Review</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={handleClose} style={styles.closeButton}>
              <CloseIcon size={16} color={colors.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(value => (
              <TouchableOpacity
                key={value}
                activeOpacity={0.7}
                onPress={() => setRating(value)}
              >
                <Image
                  source={value <= rating ? icons.star : icons.blankStar}
                  style={styles.starIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type here..."
            placeholderTextColor={colors.placeHolder}
            multiline
            style={styles.input}
          />

          <CustomButton title="Submit" onPress={handleSubmit} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddReviewModal;

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
    backgroundColor: colors.white,
    borderRadius: wp(20),
    padding: wp(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(24),
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
  },
  closeButton: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.EBEBEB,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp(14),
    marginBottom: hp(24),
  },
  starIcon: {
    width: wp(30),
    height: wp(30),
  },
  input: {
    height: hp(105),
    borderRadius: wp(14),
    borderWidth: 1,
    borderColor: colors.reviewInputBorder,
    backgroundColor: colors.reviewInputBg,
    padding: wp(16),
    textAlignVertical: 'top',
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
    marginBottom: hp(24),
  },
});
