import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import CatDetailSheet from '../components/CatDetailSheet';
import { MatchesStackParamList } from './MatchesScreen';
import { Message } from '../types';
import { colors, radius, spacing, CONTENT_MAX_W } from '../theme';
import { formatDay, formatDistance, formatLastActive, formatTime } from '../utils/format';

const QUICK_TEMPLATES = [
  'Hey ! Nos chats pourraient jouer ? 🐱',
  'On se retrouve dans la cour demain ?',
  'Il est plutôt du matin ou du soir ?',
  'Ton chat est trop mignon ! 😍',
];

export default function ChatScreen() {
  const route = useRoute<RouteProp<MatchesStackParamList, 'Chat'>>();
  const navigation = useNavigation<any>();
  const { matches, sendMessage, markSeen, unmatch } = useApp();
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [details, setDetails] = useState(false);
  const listRef = useRef<FlatList>(null);

  const match = matches.find((m) => m.cat.id === route.params.catId);

  useEffect(() => {
    if (match) markSeen(match.cat.id);
  }, [match?.cat.id, markSeen]);

  useLayoutEffect(() => {
    if (!match) return;
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity style={styles.headerTitle} onPress={() => setDetails(true)}>
          <Image source={match.cat.photos[0]} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerName}>{match.cat.name}</Text>
            <Text style={styles.headerMeta}>
              {formatLastActive(match.cat.lastActiveMin)} · {formatDistance(match.cat.distanceM)}
            </Text>
          </View>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={confirmUnmatch} hitSlop={10}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, match?.cat.id]);

  if (!match) return null;

  function confirmUnmatch() {
    if (!match) return;
    const cat = match.cat;
    const done = () => {
      unmatch(cat.id);
      navigation.goBack();
    };
    if (Platform.OS === 'web') {
      // Alert.alert n'a pas de boutons sur react-native-web.
      if (window.confirm(`Se dématcher de ${cat.name} ? La conversation sera supprimée.`)) done();
      return;
    }
    Alert.alert(`Se dématcher de ${cat.name} ?`, 'La conversation sera définitivement supprimée.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se dématcher', style: 'destructive', onPress: done },
    ]);
  }

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(match.cat.id, trimmed);
    setDraft('');
    setTyping(true);
    setTimeout(() => setTyping(false), 2400);
  };

  // Insère un séparateur de date entre deux jours différents.
  const items: (Message | { separator: string })[] = [];
  let lastDay = '';
  for (const m of match.messages) {
    const day = formatDay(m.at);
    if (day !== lastDay) {
      items.push({ separator: day });
      lastDay = day;
    }
    items.push(m);
  }

  const lastMine = [...match.messages].reverse().find((m) => m.from === 'me');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.matchBanner}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
          <Text style={styles.matchBannerText}>
            Vous avez matché {formatDay(match.matchedAt).toLowerCase()}. Écrivez-vous ici — le
            numéro de {match.cat.owner.name} reste masqué.
          </Text>
        </View>

        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(item, i) => ('separator' in item ? `sep-${i}` : item.id)}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            if ('separator' in item) {
              return <Text style={styles.daySeparator}>{item.separator}</Text>;
            }
            const mine = item.from === 'me';
            return (
              <View style={[styles.bubbleWrap, mine ? styles.wrapMe : styles.wrapThem]}>
                <View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleThem]}>
                  <Text style={mine ? styles.textMe : styles.textThem}>{item.text}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{formatTime(item.at)}</Text>
                  {mine && item.id === lastMine?.id && (
                    <Text style={styles.metaText}>
                      {item.readAt ? '· Lu' : '· Envoyé'}
                    </Text>
                  )}
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            typing ? (
              <View style={[styles.bubbleWrap, styles.wrapThem]}>
                <View style={[styles.bubble, styles.bubbleThem, styles.typing]}>
                  <Text style={styles.typingText}>{match.cat.name} écrit…</Text>
                </View>
              </View>
            ) : null
          }
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.templateStrip}
          contentContainerStyle={styles.templates}
        >
          {QUICK_TEMPLATES.map((t) => (
            <TouchableOpacity key={t} style={styles.template} onPress={() => send(t)}>
              <Text style={styles.templateText}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder={`Écris à ${match.cat.owner.name}…`}
            placeholderTextColor={colors.textLight}
            onSubmitEditing={() => send(draft)}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !draft.trim() && { opacity: 0.4 }]}
            disabled={!draft.trim()}
            onPress={() => send(draft)}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CatDetailSheet cat={details ? match.cat : null} matched onClose={() => setDetails(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  headerAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.border },
  headerName: { fontWeight: '800', fontSize: 15.5, color: colors.text },
  headerMeta: { fontSize: 11.5, color: colors.textLight },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s + 2,
    alignSelf: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_W,
  },
  matchBannerText: { flex: 1, fontSize: 12, color: colors.primaryDark, lineHeight: 17 },
  list: {
    padding: spacing.m,
    alignSelf: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_W,
  },
  daySeparator: {
    alignSelf: 'center',
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textLight,
    marginVertical: spacing.m,
  },
  bubbleWrap: { marginBottom: spacing.s + 2, maxWidth: '82%' },
  wrapMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  wrapThem: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.l },
  bubbleMe: { backgroundColor: colors.primary, borderBottomRightRadius: 5 },
  bubbleThem: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 5,
  },
  textMe: { color: '#fff', fontSize: 15, lineHeight: 21 },
  textThem: { color: colors.text, fontSize: 15, lineHeight: 21 },
  metaRow: { flexDirection: 'row', gap: 4, marginTop: 3, paddingHorizontal: 4 },
  metaText: { fontSize: 10.5, color: colors.textLight },
  typing: { paddingVertical: 12 },
  typingText: { color: colors.textLight, fontSize: 13.5, fontStyle: 'italic' },
  templateStrip: { flexGrow: 0 },
  templates: { gap: spacing.s, paddingHorizontal: spacing.m, paddingBottom: spacing.s },
  template: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  templateText: { color: colors.primaryDark, fontSize: 13, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.s,
    paddingHorizontal: spacing.m,
    paddingTop: spacing.s,
    paddingBottom: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    alignSelf: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_W,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.l,
    paddingHorizontal: spacing.m,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.text,
    maxHeight: 110,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
