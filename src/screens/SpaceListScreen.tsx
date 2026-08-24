import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../assets/icons';
import SpaceCard from '../components/SpaceCard';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { NEAR_YOU, FEATURED } from '../utils/spacesMockData';
import { SpaceListScreenProps } from '../interface/screenTypes';

const TITLES = {
  nearYou: 'Space Near You',
  featured: 'Featured spaces',
};

const SpaceListScreen = ({ navigation, route }: SpaceListScreenProps) => {
  const { listType } = route.params;
  const data = listType === 'featured' ? FEATURED : NEAR_YOU;
  const paddedData = data.length % 2 !== 0 ? [...data, null] : data;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={icons.back} style={styles.backIcon} />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {TITLES[listType]}
        </Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={paddedData}
        keyExtractor={(item, index) => item?.id ?? `placeholder-${index}`}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) =>
          item ? (
            <SpaceCard
              data={item}
              style={styles.card}
              onPress={() => navigation.navigate('PlaceDetailScreen', { spaceId: item.id })}
            />
          ) : (
            <View style={styles.card} />
          )
        }
      />
    </SafeAreaView>
  );
};

export default SpaceListScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
  },
  backButton: {
    width: wp(38),
    height: wp(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: wp(32),
    height: wp(32),
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
  },
  content: {
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(30),
    gap: hp(16),
  },
  row: {
    gap: wp(14),
  },
  card: {
    flex: 1,
    width: undefined,
  },
});
