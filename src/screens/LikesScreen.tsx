import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import CatDetailSheet from '../components/CatDetailSheet';
import { Cat } from '../types';
import { colors, radius, shadow, spacing, CONTENT_MAX_W } from '../theme';
import { EmptyState, PrimaryButton, VerifiedBadge } from '../components/ui';
import { ageLabel, formatDistance } from '../utils/format';

/**
 * « Qui t'a liké » : la carotte Premium de toutes les applis de rencontre.
 * Les photos sont floutées ; liker en retour crée le match immédiatement.
 */
export default function LikesScreen() {
  const { likesReceived, profile, likeCat, passCat } = useApp();
  const navigation = useNavigation<any>();
  const [revealed, setRevealed] = useState<string[]>([]);
  const [details, setDetails] = useState<Cat | null>(null);

  if (likesReceived.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header count={0} />
        <EmptyState
          emoji="💌"
          title="Pas encore de like reçu"
          text={`Complète le profil de ${profile.name} et swipe un peu : les likes arrivent vite dans le quartier.`}
          cta={
            <PrimaryButton
              label="Aller swiper"
              icon="paw"
              onPress={() => navigation.navigate('Découvrir')}
            />
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header count={likesReceived.length} />
      <FlatList
        data={likesReceived}
        keyExtractor={(l) => l.cat.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.m }}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={
          <View style={styles.premiumBanner}>
            <Ionicons name="diamond" size={17} color={colors.gold} />
            <Text style={styles.premiumText}>
              Passe en Premium pour découvrir tout le monde d'un coup.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const open = revealed.includes(item.cat.id);
          return (
            <View style={styles.tile}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  open
                    ? setDetails(item.cat)
                    : setRevealed((r) => [...r, item.cat.id])
                }
              >
                <Image
                  source={item.cat.photos[0]}
                  style={styles.tilePhoto}
                  blurRadius={open ? 0 : 22}
                />
                {!open && (
                  <View style={styles.lockOverlay}>
                    <Ionicons name="eye-off" size={22} color="#fff" />
                    <Text style={styles.lockText}>Toucher pour révéler</Text>
                  </View>
                )}
                {item.superLike && (
                  <View style={styles.superBadge}>
                    <Ionicons name="star" size={11} color="#fff" />
                    <Text style={styles.superBadgeText}>Super like</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.tileBody}>
                <View style={styles.tileNameRow}>
                  <Text style={styles.tileName} numberOfLines={1}>
                    {open ? item.cat.name : '••••••'}
                  </Text>
                  {open && item.cat.verified && <VerifiedBadge size={13} />}
                </View>
                <Text style={styles.tileMeta}>
                  {open
                    ? `${ageLabel(item.cat.age)} · ${formatDistance(item.cat.distanceM)}`
                    : `À ${formatDistance(item.cat.distanceM)}`}
                </Text>

                {open && (
                  <View style={styles.tileActions}>
                    <TouchableOpacity
                      style={[styles.tileBtn, { borderColor: colors.pass }]}
                      onPress={() => passCat(item.cat)}
                    >
                      <Ionicons name="close" size={17} color={colors.pass} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.tileBtn, { borderColor: colors.like, flex: 1 }]}
                      onPress={() => {
                        likeCat(item.cat);
                        navigation.navigate('Matches');
                      }}
                    >
                      <Ionicons name="heart" size={16} color={colors.like} />
                      <Text style={styles.tileBtnText}>Match</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />

      <CatDetailSheet
        cat={details}
        onClose={() => setDetails(null)}
        onLike={(c) => {
          likeCat(c);
          navigation.navigate('Matches');
        }}
        onPass={passCat}
      />
    </SafeAreaView>
  );
}

function Header({ count }: { count: number }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>💌 Likes reçus</Text>
      {count > 0 && (
        <View style={styles.headerPill}>
          <Text style={styles.headerPillText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  title: { fontSize: 23, fontWeight: '800', color: colors.primary },
  headerPill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  headerPillText: { color: '#fff', fontWeight: '800', fontSize: 12.5 },
  grid: {
    padding: spacing.m,
    gap: spacing.m,
    alignSelf: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_W,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    backgroundColor: colors.goldSoft,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: '#F5E0B8',
  },
  premiumText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 18 },
  tile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.m,
    overflow: 'hidden',
    ...shadow.soft,
  },
  tilePhoto: { width: '100%', height: 165, backgroundColor: colors.border },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(45,42,38,0.25)',
  },
  lockText: { color: '#fff', fontSize: 11.5, fontWeight: '700' },
  superBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.superLike,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  superBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  tileBody: { padding: spacing.s + 2 },
  tileNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tileName: { fontWeight: '800', color: colors.text, fontSize: 14.5, flexShrink: 1 },
  tileMeta: { color: colors.textLight, fontSize: 12, marginTop: 2 },
  tileActions: { flexDirection: 'row', gap: 6, marginTop: spacing.s },
  tileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  tileBtnText: { fontWeight: '700', color: colors.like, fontSize: 12.5 },
});
