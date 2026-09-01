import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import SwipeDeck from '../components/SwipeDeck';
import CatDetailSheet from '../components/CatDetailSheet';
import FiltersSheet from './FiltersSheet';
import { Cat, Match } from '../types';
import { colors, radius, shadow, spacing, CONTENT_MAX_W } from '../theme';
import { EmptyState, PrimaryButton } from '../components/ui';
import { compatibility } from '../utils/format';

export default function DiscoverScreen() {
  const {
    deck,
    profile,
    filters,
    swipesLeft,
    superLikesLeft,
    canUndo,
    likeCat,
    passCat,
    superLikeCat,
    undoSwipe,
    resetFilters,
  } = useApp();
  const navigation = useNavigation<any>();
  const [details, setDetails] = useState<Cat | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);

  const topCat = deck[0];
  const activeFilters =
    (filters.radiusM !== 2000 ? 1 : 0) +
    (filters.ageRange[0] !== 1 || filters.ageRange[1] !== 12 ? 1 : 0) +
    (filters.sex !== 'Tous' ? 1 : 0) +
    filters.meetingPlaces.length +
    filters.temperaments.length +
    (filters.verifiedOnly ? 1 : 0);

  const handleLike = (cat: Cat) => {
    const m = likeCat(cat);
    if (m) setMatch(m);
  };
  const handleSuperLike = (cat: Cat) => {
    const m = superLikeCat(cat);
    if (m) setMatch(m);
  };

  const outOfSwipes = swipesLeft <= 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🐱 CatMatch</Text>
          <View style={styles.headerRight}>
            <View style={styles.counter}>
              <Ionicons name="flash" size={13} color={colors.gold} />
              <Text style={styles.counterText}>{swipesLeft}</Text>
            </View>
            <TouchableOpacity style={styles.filterBtn} onPress={() => setFiltersOpen(true)}>
              <Ionicons name="options-outline" size={19} color={colors.text} />
              {activeFilters > 0 && (
                <View style={styles.filterDot}>
                  <Text style={styles.filterDotText}>{activeFilters}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {outOfSwipes ? (
          <EmptyState
            emoji="⚡️"
            title="Plus de swipes pour aujourd'hui"
            text="Tu as utilisé tes 50 swipes quotidiens. Reviens demain, ou passe en Premium pour des swipes illimités."
            cta={<PrimaryButton label="Découvrir Premium" tone="gold" icon="diamond" />}
          />
        ) : !topCat ? (
          <EmptyState
            emoji="😿"
            title={activeFilters > 0 ? 'Aucun chat avec ces filtres' : 'Plus de chats dans le coin…'}
            text={
              activeFilters > 0
                ? 'Élargis la distance ou retire quelques critères pour voir plus de profils.'
                : 'Tu as vu tous les chats du quartier ! Élargis ton rayon de recherche ou reviens plus tard.'
            }
            cta={
              activeFilters > 0 ? (
                <PrimaryButton label="Réinitialiser les filtres" onPress={resetFilters} />
              ) : (
                <PrimaryButton
                  label="Ouvrir les filtres"
                  icon="options-outline"
                  onPress={() => setFiltersOpen(true)}
                />
              )
            }
          />
        ) : (
          <>
            <SwipeDeck
              cats={deck}
              profile={profile}
              onLike={handleLike}
              onPass={passCat}
              onSuperLike={handleSuperLike}
              onOpenDetails={setDetails}
            />

            <View style={styles.actions}>
              <ActionButton
                icon="arrow-undo"
                color={colors.gold}
                size={20}
                small
                disabled={!canUndo}
                onPress={undoSwipe}
              />
              <ActionButton
                icon="close"
                color={colors.pass}
                size={30}
                onPress={() => passCat(topCat)}
              />
              <ActionButton
                icon="star"
                color={colors.superLike}
                size={22}
                small
                badge={superLikesLeft}
                disabled={superLikesLeft <= 0}
                onPress={() => handleSuperLike(topCat)}
              />
              <ActionButton
                icon="heart"
                color={colors.like}
                size={30}
                onPress={() => handleLike(topCat)}
              />
              <ActionButton
                icon="information"
                color={colors.textLight}
                size={22}
                small
                onPress={() => setDetails(topCat)}
              />
            </View>
            <Text style={styles.swipeHint}>
              Glisse à droite pour liker · en haut pour un super like
            </Text>
          </>
        )}
      </View>

      <CatDetailSheet
        cat={details}
        onClose={() => setDetails(null)}
        onLike={handleLike}
        onPass={passCat}
      />

      <FiltersSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        resultCount={deck.length}
      />

      {/* Écran « C'est un match ! » */}
      <Modal visible={!!match} animationType="fade" transparent onRequestClose={() => setMatch(null)}>
        {match && (
          <View style={styles.matchOverlay}>
            <View style={styles.matchCard}>
              <Text style={styles.matchKicker}>
                {match.superLike ? 'SUPER LIKE RENDU' : 'VOUS VOUS ÊTES LIKÉS'}
              </Text>
              <Text
                style={[styles.matchTitle, match.superLike && { color: colors.superLike }]}
              >
                C'est un match ! 🎉
              </Text>

              <View style={styles.matchPhotos}>
                <Image source={profile.photo} style={[styles.matchPhoto, { marginRight: -18 }]} />
                <View
                  style={[
                    styles.matchHeart,
                    match.superLike && { backgroundColor: colors.superLike },
                  ]}
                >
                  <Ionicons name={match.superLike ? 'star' : 'heart'} size={17} color="#fff" />
                </View>
                <Image
                  source={match.cat.photos[0]}
                  style={[styles.matchPhoto, { marginLeft: -18 }]}
                />
              </View>

              <Text style={styles.matchText}>
                {profile.name} et {match.cat.name} pourraient devenir copains — vous avez{' '}
                {compatibility(profile, match.cat)} % d'affinité.
              </Text>
              <Text style={styles.matchSub}>
                Le contact de {match.cat.owner.name} reste masqué : écrivez-vous d'abord ici.
              </Text>

              <PrimaryButton
                label="Envoyer un message"
                icon="chatbubble"
                style={{ alignSelf: 'stretch', marginTop: spacing.l }}
                onPress={() => {
                  const cat = match.cat;
                  setMatch(null);
                  navigation.navigate('Matches', {
                    screen: 'Chat',
                    params: { catId: cat.id },
                  });
                }}
              />
              <TouchableOpacity onPress={() => setMatch(null)} style={{ padding: spacing.s }}>
                <Text style={styles.matchLater}>Continuer à swiper</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

function ActionButton({
  icon,
  color,
  size,
  small,
  disabled,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  small?: boolean;
  disabled?: boolean;
  badge?: number;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,
        small && styles.actionBtnSmall,
        { borderColor: disabled ? colors.border : color },
        disabled && { opacity: 0.45 },
      ]}
      activeOpacity={0.7}
      disabled={disabled}
      onPress={onPress}
    >
      <Ionicons name={icon} size={size} color={disabled ? colors.textLight : color} />
      {badge !== undefined && badge > 0 && (
        <View style={[styles.actionBadge, { backgroundColor: color }]}>
          <Text style={styles.actionBadgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, alignItems: 'center' },
  content: { flex: 1, width: '100%', maxWidth: CONTENT_MAX_W },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  logo: { fontSize: 23, fontWeight: '800', color: colors.primary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  counterText: { fontWeight: '700', color: colors.text, fontSize: 13 },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDotText: { color: '#fff', fontSize: 10.5, fontWeight: '800' },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.m,
    paddingTop: spacing.m,
  },
  actionBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  actionBtnSmall: { width: 46, height: 46, borderRadius: 23 },
  actionBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  swipeHint: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 12,
    paddingVertical: spacing.s,
  },
  matchOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.l,
  },
  matchCard: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    padding: spacing.l,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  matchKicker: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textLight,
    letterSpacing: 1.4,
  },
  matchTitle: { fontSize: 27, fontWeight: '800', color: colors.primary, marginTop: 4 },
  matchPhotos: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.l,
  },
  matchPhoto: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 4,
    borderColor: colors.card,
    backgroundColor: colors.border,
  },
  matchHeart: {
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.card,
  },
  matchText: {
    fontSize: 15.5,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  matchSub: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: spacing.s,
  },
  matchLater: { color: colors.textLight, marginTop: spacing.s, fontSize: 14, fontWeight: '600' },
});
