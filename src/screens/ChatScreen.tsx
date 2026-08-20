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

import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';
import { MainTabScreenProps } from '../navigation/TabNav';

interface ChatPreview {
  id: string;
  name: string;
  message: string;
  time: string;
  unread: number;
}

const CHATS: ChatPreview[] = [
  { id: 'c1', name: 'James', message: 'Hi! Is the beauty room still available?', time: '4:10 PM', unread: 1 },
  { id: 'c2', name: 'Ethan', message: "I'm interested in booking your chair.", time: '4:26 PM', unread: 0 },
  { id: 'c3', name: 'Olivia', message: 'Can I change my booking date?', time: '4:53 PM', unread: 2 },
  { id: 'c4', name: 'Sophia', message: 'Thanks! The space looks perfect for me.', time: '3:50 PM', unread: 0 },
  { id: 'c5', name: 'Liam', message: 'Is Wi-Fi included with the rental?', time: '2:43 PM', unread: 0 },
  { id: 'c6', name: 'Michael', message: "I've sent my CV for the apprentice position.", time: '2:23 PM', unread: 0 },
];

const ChatScreen = ({ navigation }: MainTabScreenProps<'Chat'>) => {
  const [search, setSearch] = useState('');

  const chats = CHATS.filter(chat =>
    chat.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchBar}>
          <Image
            source={icons.search_black}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Type to search..."
            placeholderTextColor={colors.placeHolder}
            style={styles.searchInput}
          />
        </View>

        {chats.map(chat => (
          <TouchableOpacity
            key={chat.id}
            activeOpacity={0.8}
            style={styles.chatRow}
            onPress={() =>
              navigation.navigate('ChatDetailScreen', { contactId: chat.id, name: chat.name })
            }
          >
            <View style={styles.avatar}>
              <Image
                source={icons.tabProfile}
                style={styles.avatarIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.chatTextCol}>
              <Text style={styles.chatName}>{chat.name}</Text>
              <Text numberOfLines={1} style={styles.chatMessage}>
                {chat.message}
              </Text>
            </View>
            <View style={styles.chatRightCol}>
              <Text style={styles.chatTime}>{chat.time}</Text>
              {chat.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{chat.unread}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  header: {
    alignItems: 'center',
    paddingVertical: hp(14),
  },
  headerTitle: {
    color: colors.black,
    fontSize: fontSize(20),
    fontFamily: fonts.Lato600,
  },
  scrollContent: {
    paddingHorizontal: wp(20),
    paddingTop: hp(16),
    paddingBottom: hp(20),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(54),
    paddingHorizontal: wp(16),
    borderRadius: wp(8),
    backgroundColor: colors.white,
    marginBottom: hp(10),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    width: wp(18),
    height: wp(18),
    marginRight: wp(10),
    tintColor: colors.subText,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    color: colors.black,
    fontSize: fontSize(14.5),
    fontFamily: fonts.Lato400,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.EBEBEB,
  },
  avatar: {
    width: wp(55),
    height: wp(55),
    borderRadius: wp(28),
    backgroundColor: colors.lightGrayF5F5F5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(12),
  },
  avatarIcon: {
    width: wp(26),
    height: wp(26),
    tintColor: colors.subText,
  },
  chatTextCol: {
    flex: 1,
    marginRight: wp(10),
  },
  chatName: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato500,
  },
  chatMessage: {
    marginTop: hp(4),
    color: colors.subText,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
  },
  chatRightCol: {
    alignItems: 'flex-end',
  },
  chatTime: {
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  unreadBadge: {
    marginTop: hp(8),
    minWidth: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    paddingHorizontal: wp(4),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: colors.white,
    fontSize: fontSize(11),
    fontFamily: fonts.Lato500,
  },
});
