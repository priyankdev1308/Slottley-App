import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import DateField from '../components/DateField';
import ToastAlert from '../components/ToastAlert';
import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { AddNewJobScreenProps } from '../interface/screenTypes';
import { HOST_JOBS } from './HostMyJobScreen';

interface SegmentedToggleProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const SegmentedToggle = ({ options, value, onChange }: SegmentedToggleProps) => (
  <View style={styles.segmentedRow}>
    {options.map(option => {
      const isSelected = option === value;
      return (
        <TouchableOpacity
          key={option}
          activeOpacity={0.85}
          onPress={() => onChange(option)}
          style={[styles.segmentedOption, isSelected && styles.segmentedOptionSelected]}
        >
          <Text
            style={[styles.segmentedText, isSelected && styles.segmentedTextSelected]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const AddNewJobScreen = ({ navigation, route }: AddNewJobScreenProps) => {
  const existingJob = HOST_JOBS.find(j => j.id === route.params?.jobId);
  const isEditing = !!existingJob;

  const [jobType, setJobType] = useState(
    existingJob?.jobType === 'Employed' ? 'Employed job' : 'Apprenticeship',
  );
  const [jobTitle, setJobTitle] = useState(existingJob?.title ?? '');
  const [salonName, setSalonName] = useState(existingJob?.company ?? '');
  const [location, setLocation] = useState(existingJob?.location.replace('London — ', '') ?? '');
  const [description, setDescription] = useState(
    existingJob?.description ??
    '',
  );
  const [hours, setHours] = useState(existingJob?.schedule === 'Part Time' ? 'Part-time' : 'Full-time');
  const [pay, setPay] = useState(existingJob?.paid === false ? 'Unpaid' : 'Paid');
  const [payAmount, setPayAmount] = useState(existingJob?.payAmount ?? '');
  const [startDate, setStartDate] = useState(existingJob?.startDate ?? '');
  const [benefits, setBenefits] = useState(existingJob?.benefits ?? '');
  const [lookingFor, setLookingFor] = useState(existingJob?.lookingFor ?? '');
  const [howToApply, setHowToApply] = useState(existingJob?.howToApply ?? '');

  const handlePostJob = () => {
    if (!jobTitle.trim() || !salonName.trim() || !location.trim()) {
      ToastAlert({ title: 'Missing information', description: 'Please fill in all required fields.' });
      return;
    }

    navigation.navigate('HostPaymentScreen', { jobId: existingJob?.id });
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={icons.back} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Job' : 'Add New Job'}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Job Type</Text>
        <SegmentedToggle
          options={['Apprenticeship', 'Employed job']}
          value={jobType}
          onChange={setJobType}
        />

        <Text style={styles.sectionLabel}>Job Title</Text>
        <TextInput
          value={jobTitle}
          onChangeText={setJobTitle}
          placeholder="Enter job title"
          placeholderTextColor={colors.placeHolder}
          style={styles.input}
        />

        <Text style={styles.sectionLabel}>Salon Name</Text>
        <TextInput
          value={salonName}
          onChangeText={setSalonName}
          placeholder="Enter salon name"
          placeholderTextColor={colors.placeHolder}
          style={styles.input}
        />

        <Text style={styles.sectionLabel}>Location</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
          placeholderTextColor={colors.placeHolder}
          style={styles.input}
        />

        <Text style={styles.sectionLabel}>Descripation</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the role"
          placeholderTextColor={colors.placeHolder}
          multiline
          textAlignVertical="top"
          style={styles.textArea}
        />

        <Text style={styles.sectionLabel}>Hours</Text>
        <SegmentedToggle options={['Full-time', 'Part-time']} value={hours} onChange={setHours} />

        <Text style={styles.sectionLabel}>Pay</Text>
        <SegmentedToggle options={['Paid', 'Unpaid']} value={pay} onChange={setPay} />

        <Text style={styles.sectionLabel}>Pay Amount</Text>
        <TextInput
          value={payAmount}
          onChangeText={setPayAmount}
          placeholder="e.g. £45"
          placeholderTextColor={colors.placeHolder}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.sectionLabel}>Start Date</Text>
        <DateField value={startDate} onChange={setStartDate} placeholder="Select start date" />

        <Text style={styles.sectionLabel}>Benefits (optional)</Text>
        <TextInput
          value={benefits}
          onChangeText={setBenefits}
          placeholder="e.g. Product Discounts, Flexible Hours"
          placeholderTextColor={colors.placeHolder}
          multiline
          textAlignVertical="top"
          style={styles.textAreaSmall}
        />

        <Text style={styles.sectionLabel}>What you're looking for (optional)</Text>
        <TextInput
          value={lookingFor}
          onChangeText={setLookingFor}
          placeholder="e.g. Friendly, Reliable"
          placeholderTextColor={colors.placeHolder}
          multiline
          textAlignVertical="top"
          style={styles.textAreaSmall}
        />

        <Text style={styles.sectionLabel}>How to apply (optional)</Text>
        <TextInput
          value={howToApply}
          onChangeText={setHowToApply}
          placeholder="e.g. Apply via app"
          placeholderTextColor={colors.placeHolder}
          multiline
          textAlignVertical="top"
          style={styles.textAreaSmall}
        />

        <CustomButton title="Post Job" onPress={handlePostJob} buttonStyle={styles.postButton} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddNewJobScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(20),
    paddingVertical: hp(14),
  },
  backButton: {
    width: wp(32),
    height: wp(32),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backIcon: {
    width: wp(32),
    height: wp(32),
    tintColor: colors.primary,
  },
  headerTitle: {
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
  },
  scrollContent: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(24),
  },
  sectionLabel: {
    marginTop: hp(20),
    marginBottom: hp(10),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: wp(12),
  },
  segmentedOption: {
    flex: 1,
    height: hp(52),
    borderRadius: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.EBEBEB,
  },
  segmentedOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentedText: {
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato700,
  },
  segmentedTextSelected: {
    color: colors.white,
    fontFamily: fonts.Lato700,
  },
  input: {
    height: hp(54),
    paddingHorizontal: wp(16),
    borderRadius: wp(12),
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  textArea: {
    height: hp(110),
    paddingHorizontal: wp(16),
    paddingTop: hp(14),
    borderRadius: wp(12),
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  textAreaSmall: {
    minHeight: hp(80),
    paddingHorizontal: wp(16),
    paddingTop: hp(14),
    borderRadius: wp(12),
    backgroundColor: colors.textPlaceHolderColor,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  postButton: {
    marginTop: hp(28),
  },
});
