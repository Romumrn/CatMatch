import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { MatchesStackParamList } from './MatchesScreen';
import { colors, spacing } from '../theme';

const QUICK_TEMPLATES = [
  'Hey ! Nos chats pourraient jouer ? 🐱',
  'On se retrouve au parc demain ?',
  'Ton chat est trop mignon ! 😍',
];

export default function ChatScreen() {
  const route = useRoute<RouteProp<MatchesStackParamList, 'Chat'>>();
  const { matches, sendMessage } = useApp();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  const match = matches.find((m) => m.cat.id === route.params.catId);
  if (!match) return null;

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(match.cat.id, trimmed);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={match.messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.m }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.from === 'me' ? styles.bubbleMe : styles.bubbleThem,
              ]}
            >
              <Text style={item.from === 'me' ? styles.textMe : styles.textThem}>
                {item.text}
              </Text>
            </View>
          )}
        />

        <View style={styles.templates}>
          {QUICK_TEMPLATES.map((t) => (
            <TouchableOpacity key={t} style={styles.template} onPress={() => send(t)}>
              <Text style={styles.templateText} numberOfLines={1}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder={`Écris à ${match.cat.owner.name}…`}
            placeholderTextColor={colors.textLight}
            onSubmitEditing={() => send(draft)}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => send(draft)}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: spacing.s,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  textMe: { color: '#fff', fontSize: 15, lineHeight: 21 },
  textThem: { color: colors.text, fontSize: 15, lineHeight: 21 },
  templates: {
    flexDirection: 'row',
    gap: spacing.s,
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
  },
  template: {
    flex: 1,
    backgroundColor: '#FFEDE5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  templateText: { fontSize: 12, color: colors.primaryDark, textAlign: 'center' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    padding: spacing.m,
    paddingTop: 0,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
