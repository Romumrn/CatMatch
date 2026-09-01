import React from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { colors, radius, shadow, spacing, CONTENT_MAX_W } from '../theme';
import { EmptyState, PrimaryButton, VerifiedBadge } from '../components/ui';
import { formatDay, formatTime } from '../utils/format';

export type MatchesStackParamList = {
  MatchesList: undefined;
  Chat: { catId: string };
};

export default function MatchesScreen() {
  const { matches, newMatches } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<MatchesStackParamList>>();
  const parent = useNavigation<any>();

  if (matches.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title}>💬 Matches</Text>
        <EmptyState
          emoji="🐾"
          title="Pas encore de match"
          text="Va swiper dans Découvrir et like les chats du quartier. Quand c'est réciproque, la conversation s'ouvre ici."
          cta={
            <PrimaryButton
              label="Commencer à swiper"
              icon="paw"
              onPress={() => parent.getParent()?.navigate('Découvrir')}
            />
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>💬 Matches</Text>

      <FlatList
        data={matches}
        keyExtractor={(m) => m.cat.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          newMatches.length > 0 ? (
            <View style={styles.newSection}>
              <Text style={styles.newTitle}>
                Nouveaux matches · {newMatches.length}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.newRow}
              >
                {newMatches.map((m) => (
                  <TouchableOpacity
                    key={m.cat.id}
                    style={styles.newItem}
                    onPress={() => navigation.navigate('Chat', { catId: m.cat.id })}
                  >
                    <View style={styles.newRing}>
                      <Image source={m.cat.photos[0]} style={styles.newAvatar} />
                    </View>
                    {m.superLike && (
                      <View style={styles.newStar}>
                        <Ionicons name="star" size={9} color="#fff" />
                      </View>
                    )}
                    <Text style={styles.newName} numberOfLines={1}>
                      {m.cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.listLabel}>Conversations</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const last = item.messages[item.messages.length - 1];
          const unread = !item.seen;
          return (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('Chat', { catId: item.cat.id })}
            >
              <View>
                <Image source={item.cat.photos[0]} style={styles.avatar} />
                {item.cat.lastActiveMin < 5 && <View style={styles.online} />}
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, unread && styles.nameUnread]}>{item.cat.name}</Text>
                    {item.cat.verified && <VerifiedBadge size={13} />}
                  </View>
                  <Text style={styles.time}>
                    {last ? formatTime(last.at) : formatDay(item.matchedAt)}
                  </Text>
                </View>
                <Text
                  style={[styles.preview, unread && styles.previewUnread]}
                  numberOfLines={1}
                >
                  {last
                    ? `${last.from === 'me' ? 'Toi : ' : ''}${last.text}`
                    : 'Dis bonjour ! 👋'}
                </Text>
              </View>

              {unread ? (
                <View style={styles.unreadDot} />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.border} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.primary,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    alignSelf: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_W,
  },
  list: {
    padding: spacing.m,
    gap: spacing.s,
    alignSelf: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_W,
  },
  newSection: { marginBottom: spacing.s },
  newTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.3,
    marginBottom: spacing.s,
  },
  newRow: { gap: spacing.m, paddingBottom: spacing.s },
  newItem: { alignItems: 'center', width: 68 },
  newRing: {
    padding: 2.5,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: colors.primary,
  },
  newAvatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.border },
  newStar: {
    position: 'absolute',
    top: 0,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.superLike,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  newName: { fontSize: 12, color: colors.text, fontWeight: '600', marginTop: 5 },
  listLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textLight,
    marginTop: spacing.m,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radius.m,
    padding: spacing.s + 4,
    ...shadow.soft,
  },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.border },
  online: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: colors.like,
    borderWidth: 2.5,
    borderColor: colors.card,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  nameUnread: { fontWeight: '800' },
  time: { fontSize: 12, color: colors.textLight },
  preview: { fontSize: 13.5, color: colors.textLight, marginTop: 3 },
  previewUnread: { color: colors.text, fontWeight: '600' },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary },
});
