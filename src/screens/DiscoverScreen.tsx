import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import SwipeDeck from '../components/SwipeDeck';
import { Cat } from '../types';
import { colors, radius, spacing } from '../theme';

export default function DiscoverScreen() {
  const { deck, swipesLeft, likeCat, passCat } = useApp();
  const [details, setDetails] = useState<Cat | null>(null);
  const [matchedCat, setMatchedCat] = useState<Cat | null>(null);

  const handleLike = (cat: Cat) => {
    const isMatch = likeCat(cat);
    if (isMatch) setMatchedCat(cat);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>🐱 CatMatch</Text>
        <View style={styles.swipeCounter}>
          <Ionicons name="flash" size={14} color={colors.gold} />
          <Text style={styles.swipeCounterText}>{swipesLeft} swipes</Text>
        </View>
      </View>

      <SwipeDeck cats={deck} onLike={handleLike} onPass={passCat} onOpenDetails={setDetails} />

      {/* Fiche détaillée */}
      <Modal visible={!!details} animationType="slide" onRequestClose={() => setDetails(null)}>
        {details && (
          <SafeAreaView style={styles.safe}>
            <ScrollView>
              <Image source={{ uri: details.photos[0] }} style={styles.detailPhoto} />
              <View style={styles.detailBody}>
                <Text style={styles.detailName}>
                  {details.name}, {details.age} an{details.age > 1 ? 's' : ''}{' '}
                  {details.sex === 'M' ? '♂' : '♀'}
                </Text>
                <Text style={styles.detailMeta}>
                  {details.type} ·{' '}
                  {details.distanceM < 1000
                    ? `${details.distanceM} m`
                    : `${(details.distanceM / 1000).toFixed(1)} km`}
                </Text>
                <View style={styles.tagsRow}>
                  {details.temperaments.map((t) => (
                    <View key={t} style={styles.tag}>
                      <Text style={styles.tagText}>{t}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.sectionTitle}>À propos</Text>
                <Text style={styles.bio}>{details.bio}</Text>
                <Text style={styles.sectionTitle}>Propriétaire</Text>
                <Text style={styles.bio}>
                  {details.owner.name}
                  {details.owner.canHost ? ' · Peut accueillir chez lui/elle' : ''}
                  {details.owner.prefersOutside ? ' · Préfère les rencontres au parc' : ''}
                </Text>
                <Text style={styles.hint}>
                  📵 Le téléphone du propriétaire est révélé après un match.
                </Text>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setDetails(null)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>
        )}
      </Modal>

      {/* Écran "C'est un match !" */}
      <Modal visible={!!matchedCat} animationType="fade" transparent>
        {matchedCat && (
          <View style={styles.matchOverlay}>
            <View style={styles.matchCard}>
              <Text style={styles.matchTitle}>C'est un match ! 🎉</Text>
              <Image source={{ uri: matchedCat.photos[0] }} style={styles.matchPhoto} />
              <Text style={styles.matchText}>
                {matchedCat.name} et ton chat pourraient devenir copains !{'\n'}Contact :{' '}
                {matchedCat.owner.name}
                {matchedCat.owner.phone ? ` · ${matchedCat.owner.phone}` : ''}
              </Text>
              <TouchableOpacity
                style={styles.matchBtn}
                onPress={() => setMatchedCat(null)}
              >
                <Text style={styles.matchBtnText}>Voir mes matches 💬</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMatchedCat(null)}>
                <Text style={styles.matchLater}>Continuer à swiper</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  logo: { fontSize: 24, fontWeight: '800', color: colors.primary },
  swipeCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  swipeCounterText: { fontWeight: '600', color: colors.text, fontSize: 13 },
  detailPhoto: { width: '100%', height: 380 },
  detailBody: { padding: spacing.l },
  detailName: { fontSize: 28, fontWeight: '800', color: colors.text },
  detailMeta: { fontSize: 15, color: colors.textLight, marginTop: 4 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.m },
  tag: {
    backgroundColor: '#FFEDE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: { color: colors.primaryDark, fontWeight: '600', fontSize: 13 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.l,
    marginBottom: spacing.xs,
  },
  bio: { fontSize: 15, color: colors.text, lineHeight: 22 },
  hint: { fontSize: 13, color: colors.textLight, marginTop: spacing.l },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45,42,38,0.85)',
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
  },
  matchTitle: { fontSize: 26, fontWeight: '800', color: colors.primary },
  matchPhoto: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginVertical: spacing.m,
    borderWidth: 4,
    borderColor: colors.like,
  },
  matchText: { fontSize: 15, color: colors.text, textAlign: 'center', lineHeight: 22 },
  matchBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.l,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: spacing.l,
  },
  matchBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  matchLater: { color: colors.textLight, marginTop: spacing.m, fontSize: 14 },
});
