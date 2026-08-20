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
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../assets/icons';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, isIos, wp } from '../helpers/responsive';
import { ChatDetailScreenProps } from '../interface/screenTypes';

interface ChatMessage {
  id: string;
  sender: 'me' | 'contact';
  text: string;
}

// Mock conversation — will come from the chat/messaging API keyed by contactId.
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'contact',
    text: "Hi! I'm interested in the Luxury Private Beauty Room. Is it still available for Friday?",
  },
  { id: 'm2', sender: 'me', text: "Hi James! Yes, it's available. What time would you like to book?" },
  {
    id: 'm3',
    sender: 'contact',
    text: 'Around 10:00 AM to 6:00 PM. Is Wi-Fi and electricity included in the rental?',
  },
  {
    id: 'm4',
    sender: 'me',
    text: 'Yes, both are included. Towels, shampoo, reception access and equipment are included as well.',
  },
  { id: 'm5', sender: 'contact', text: 'Perfect! And is the price £45 for the full day?' },
];

const ChatDetailScreen = ({ navigation, route }: ChatDetailScreenProps) => {
  const { name } = route.params;
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages(prev => [...prev, { id: `m${prev.length + 1}`, sender: 'me', text: draft.trim() }]);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={icons.back} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Image
            source={icons.tabProfile}
            style={styles.headerAvatarIcon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headerName}>{name}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={isIos ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.dateLabel}>Today 4:20 PM</Text>

          {messages.map(message => {
            const isMe = message.sender === 'me';
            return (
              <View
                key={message.id}
                style={[styles.messageRow, isMe && styles.messageRowMe]}
              >
                {!isMe && (
                  <View style={styles.bubbleAvatar}>
                    <Image
                      source={icons.tabProfile}
                      style={styles.bubbleAvatarIcon}
                      resizeMode="contain"
                    />
                  </View>
                )}
                <View style={[styles.bubble, isMe ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={[styles.bubbleText, isMe && styles.bubbleTextMine]}>
                    {message.text}
                  </Text>
                </View>
                {isMe && (
                  <View style={styles.bubbleAvatar}>
                    <Image
                      source={icons.tabProfile}
                      style={styles.bubbleAvatarIcon}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type Message...."
            placeholderTextColor={colors.placeHolder}
            style={styles.input}
          />
          <TouchableOpacity activeOpacity={0.85} onPress={sendMessage}>
            <Image source={icons.sendMessage} style={styles.sendIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatDetailScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.screenBgColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(20),
    paddingVertical: hp(14),
  },
  backButton: {
    width: wp(32),
    height: wp(32),
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: wp(6),
  },
  backIcon: {
    width: wp(22),
    height: wp(22),
    tintColor: colors.primary,
  },
  headerAvatar: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(19),
    backgroundColor: colors.lightGrayF5F5F5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(10),
  },
  headerAvatarIcon: {
    width: wp(20),
    height: wp(20),
    tintColor: colors.subText,
  },
  headerName: {
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.Lato500,
  },
  scrollContent: {
    paddingHorizontal: wp(10),
    paddingTop: hp(10),
    paddingBottom: hp(20),
  },
  dateLabel: {
    alignSelf: 'center',
    marginBottom: hp(16),
    color: colors.subText,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato500,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginBottom: hp(14),
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  bubbleAvatar: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    backgroundColor: colors.lightGrayF5F5F5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp(8),
  },
  bubbleAvatarIcon: {
    width: wp(16),
    height: wp(16),
    tintColor: colors.subText,
  },
  bubble: {
    maxWidth: '70%',
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
    borderRadius: wp(10),
  },
  bubbleTheirs: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 0,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 0,
  },
  bubbleText: {
    color: colors.black,
    fontSize: fontSize(14),
    lineHeight: fontSize(19),
    fontFamily: fonts.Lato500,
  },
  bubbleTextMine: {
    color: colors.white,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(20),
    paddingTop: hp(10),
    paddingBottom: hp(5),
    gap: wp(10),
  },
  input: {
    flex: 1,
    height: hp(52),
    paddingHorizontal: wp(16),
    borderRadius: wp(8),
    backgroundColor: colors.white,
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.Lato400,
    borderColor: '#00000017',
    borderWidth: 1

  },
  sendIcon: {
    width: wp(52),
    height: wp(52),
  },
});
