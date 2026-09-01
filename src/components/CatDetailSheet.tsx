import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Cat } from '../types';
import { useApp } from '../context/AppContext';
import { colors, radius, shadow, spacing, CONTENT_MAX_W } from '../theme';
import { Chip, PrimaryButton, VerifiedBadge } from './ui';
import {
  ageLabel,
  compatibility,
  formatDistance,
  formatLastActive,
  maskPhone,
} from '../utils/format';

interface Props {
  cat: Cat | null;
  /** Un match existe déjà : on affiche le bloc contact plutôt que les boutons de swipe. */
  matched?: boolean;
  onClose: () => void;
  onLike?: (cat: Cat) => void;
  onPass?: (cat: Cat) => void;
}

export default function CatDetailSheet({ cat, matched, onClose, onLike, onPass }: Props) {
  const { profile, reportCat } = useApp();
  const [photoIndex, setPhotoIndex] = useState(0);

  if (!cat) return null;
  const score = compatibility(profile, cat);
  const sharedPlaces = cat.meetingPlaces.filter((p) => profile.meetingPlaces.includes(p));

  const confirmReport = () => {
    const done = () => {
      reportCat(cat.id);
      onClose();
    };
    if (Platform.OS === 'web') {
      // Alert.alert n'a pas de boutons sur react-native-web.
      if (window.confirm(`Signaler le profil de ${cat.name} ? Il ne te sera plus proposé.`)) done();
      return;
    }
    Alert.alert(
      `Signaler ${cat.name} ?`,
      'Le profil ne te sera plus proposé et notre équipe le passera en revue.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Signaler', style: 'destructive', onPress: done },
      ]
    );
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <View>
              <Image source={cat.photos[photoIndex]} style={styles.photo} />

              {/* Barres de progression facon story + zones de tap gauche/droite */}
              {cat.photos.length > 1 && (
                <>
                  <View style={styles.progressRow}>
                    {cat.photos.map((_, i) => (
                      <View
                        key={i}
                        style={[styles.progressBar, i === photoIndex && styles.progressBarActive]}
                      />
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[styles.tapZone, { left: 0 }]}
                    activeOpacity={1}
                    onPress={() => setPhotoIndex((i) => Math.max(0, i - 1))}
                  />
                  <TouchableOpacity
                    style={[styles.tapZone, { right: 0 }]}
                    activeOpacity={1}
                    onPress={() => setPhotoIndex((i) => Math.min(cat.photos.length - 1, i + 1))}
                  />
                </>
              )}

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="chevron-down" size={24} color="#fff" />
              </TouchableOpacity>

              <View style={styles.scoreBadge}>
                <Ionicons name="sparkles" size={13} color={colors.primary} />
                <Text style={styles.scoreText}>{score} % d'affinité</Text>
              </View>
            </View>

            <View style={styles.body}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>
                  {cat.name}, {ageLabel(cat.age)}
                </Text>
                {cat.verified && <VerifiedBadge size={20} />}
                <Text style={styles.sex}>{cat.sex === 'M' ? '♂' : '♀'}</Text>
              </View>
              <Text style={styles.meta}>
                {cat.breed} · {cat.type}
              </Text>
              <View style={styles.metaRow}>
                <Ionicons name="location" size={14} color={colors.primary} />
                <Text style={styles.metaSmall}>À {formatDistance(cat.distanceM)} de toi</Text>
                <Text style={styles.dot}>·</Text>
                <View
                  style={[styles.presence, cat.lastActiveMin < 5 && { backgroundColor: colors.like }]}
                />
                <Text style={styles.metaSmall}>{formatLastActive(cat.lastActiveMin)}</Text>
              </View>

              <Block title="À propos">
                <Text style={styles.bio}>{cat.bio}</Text>
              </Block>

              <Block title="Tempérament">
                <View style={styles.row}>
                  {cat.temperaments.map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      active={profile.temperaments.includes(t)}
                      tone={profile.temperaments.includes(t) ? 'like' : 'primary'}
                    />
                  ))}
                </View>
                {cat.temperaments.some((t) => profile.temperaments.includes(t)) && (
                  <Text style={styles.hintGood}>
                    <Ionicons name="checkmark-circle" size={12} color={colors.like} /> En vert : ce
                    que {cat.name} a en commun avec {profile.name}
                  </Text>
                )}
              </Block>

              <Block title="Lieu de rencontre préféré">
                <View style={styles.row}>
                  {cat.meetingPlaces.map((p) => (
                    <Chip
                      key={p}
                      label={p}
                      icon={placeIcon(p)}
                      active={sharedPlaces.includes(p)}
                      tone={sharedPlaces.includes(p) ? 'like' : 'primary'}
                    />
                  ))}
                </View>
                {sharedPlaces.length > 0 && (
                  <Text style={styles.hintGood}>
                    <Ionicons name="checkmark-circle" size={12} color={colors.like} /> Vous êtes
                    d'accord sur {sharedPlaces.length > 1 ? 'plusieurs lieux' : sharedPlaces[0]}
                  </Text>
                )}
              </Block>

              <Block title="Santé">
                <View style={styles.row}>
                  <HealthChip ok={cat.health.vaccinated} label="Vacciné·e" />
                  <HealthChip ok={cat.health.sterilized} label="Stérilisé·e" />
                  <HealthChip ok={cat.health.chipped} label="Pucé·e" />
                </View>
              </Block>

              <Block title="Propriétaire">
                <View style={styles.ownerCard}>
                  <View style={styles.ownerAvatar}>
                    <Text style={styles.ownerInitial}>{cat.owner.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ownerName}>{cat.owner.name}</Text>
                    <Text style={styles.ownerPhone}>{maskPhone(cat.owner.phone)}</Text>
                  </View>
                  <Ionicons
                    name={matched ? 'lock-open-outline' : 'lock-closed'}
                    size={18}
                    color={colors.textLight}
                  />
                </View>
                <Text style={styles.hint}>
                  {matched
                    ? '🔒 Le numéro reste masqué : échangez-le vous-mêmes dans le chat quand vous le sentez.'
                    : '🔒 Le numéro n’est jamais affiché en clair. Passez par le chat après un match.'}
                </Text>
              </Block>

              <TouchableOpacity style={styles.reportBtn} onPress={confirmReport}>
                <Ionicons name="flag-outline" size={15} color={colors.textLight} />
                <Text style={styles.reportText}>Signaler ce profil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {!matched && onLike && onPass && (
          <View style={styles.footer}>
            <PrimaryButton
              label="Passer"
              icon="close"
              tone="ghost"
              style={styles.footerBtn}
              onPress={() => {
                onPass(cat);
                onClose();
              }}
            />
            <PrimaryButton
              label={`Liker ${cat.name}`}
              icon="heart"
              style={[styles.footerBtn, { flex: 1.6 }]}
              onPress={() => {
                onLike(cat);
                onClose();
              }}
            />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

export function placeIcon(p: string): keyof typeof Ionicons.glyphMap {
  if (p === 'Parc') return 'leaf-outline';
  if (p === 'Appartement') return 'home-outline';
  return 'business-outline';
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: spacing.l }}>
      <Text style={styles.blockTitle}>{title}</Text>
      {children}
    </View>
  );
}

function HealthChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={[styles.health, ok && styles.healthOk]}>
      <Ionicons
        name={ok ? 'checkmark-circle' : 'close-circle'}
        size={14}
        color={ok ? colors.like : colors.textLight}
      />
      <Text style={[styles.healthText, ok && { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { alignItems: 'center', paddingBottom: spacing.xl },
  content: { width: '100%', maxWidth: CONTENT_MAX_W },
  photo: { width: '100%', height: 420, backgroundColor: colors.border },
  progressRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
  },
  progressBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  progressBarActive: { backgroundColor: '#fff' },
  tapZone: { position: 'absolute', top: 30, bottom: 0, width: '35%' },
  closeBtn: {
    position: 'absolute',
    top: 28,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadge: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
    ...shadow.soft,
  },
  scoreText: { fontWeight: '800', fontSize: 12.5, color: colors.text },
  body: { padding: spacing.l },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  name: { fontSize: 27, fontWeight: '800', color: colors.text },
  sex: { fontSize: 20, color: colors.textLight },
  meta: { fontSize: 15, color: colors.textLight, marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  metaSmall: { fontSize: 13.5, color: colors.textLight },
  dot: { color: colors.textLight },
  presence: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textLight },
  blockTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.s,
  },
  bio: { fontSize: 15.5, color: colors.text, lineHeight: 23 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  hintGood: { fontSize: 12.5, color: colors.like, marginTop: 8, fontWeight: '600' },
  hint: { fontSize: 12.5, color: colors.textLight, marginTop: 10, lineHeight: 18 },
  health: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  healthOk: { backgroundColor: colors.likeSoft, borderColor: colors.likeSoft },
  healthText: { fontSize: 13, color: colors.textLight, fontWeight: '600' },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radius.m,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ownerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInitial: { fontWeight: '800', color: colors.primary, fontSize: 17 },
  ownerName: { fontWeight: '700', color: colors.text, fontSize: 15 },
  ownerPhone: { color: colors.textLight, fontSize: 14, marginTop: 2, letterSpacing: 1 },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.xl,
    paddingVertical: spacing.s,
  },
  reportText: { color: colors.textLight, fontSize: 13.5, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    gap: spacing.s,
    padding: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  footerBtn: { flex: 1 },
});
