import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { colors, spacing } from '../theme';

export type MatchesStackParamList = {
  MatchesList: undefined;
  Chat: { catId: string };
};

export default function MatchesScreen() {
  const { matches } = useApp();
  const navigation =
    useNavigation<NativeStackNavigationProp<MatchesStackParamList>>();

  if (matches.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title}>💬 Matches</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🐾</Text>
          <Text style={styles.emptyTitle}>Pas encore de match</Text>
          <Text style={styles.emptyText}>
            Va dans l'onglet Découvrir et like des chats près de chez toi !
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>💬 Matches</Text>
      <FlatList
        data={matches}
        keyExtractor={(m) => m.cat.id}
        contentContainerStyle={{ padding: spacing.m }}
        renderItem={({ item }) => {
          const last = item.messages[item.messages.length - 1];
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('Chat', { catId: item.cat.id })}
            >
              <Image source={{ uri: item.cat.photos[0] }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <Text style={styles.name}>{item.cat.name}</Text>
                  <Text style={styles.distance}>
                    {item.cat.distanceM < 1000
                      ? `${item.cat.distanceM} m`
                      : `${(item.cat.distanceM / 1000).toFixed(1)} km`}
                  </Text>
                </View>
                <Text style={styles.owner}>
                  {item.cat.owner.name}
                  {item.cat.owner.phone ? ` · ${item.cat.owner.phone}` : ''}
                </Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {last ? `${last.from === 'me' ? 'Toi : ' : ''}${last.text}` : 'Dis bonjour ! 👋'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
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
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  distance: { fontSize: 13, color: colors.textLight },
  owner: { fontSize: 13, color: colors.secondary, marginTop: 2 },
  preview: { fontSize: 14, color: colors.textLight, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.m },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.s },
  emptyText: { fontSize: 15, color: colors.textLight, textAlign: 'center' },
});
