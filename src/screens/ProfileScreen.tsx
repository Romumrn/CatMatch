import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useSound } from '../context/SoundContext';
import { MeetingPlace, Temperament } from '../types';
import { colors, radius, shadow, spacing, CONTENT_MAX_W } from '../theme';
import { Chip, PrimaryButton, VerifiedBadge } from '../components/ui';
import { placeIcon } from '../components/CatDetailSheet';
import { ageLabel, maskPhone, profileCompletion } from '../utils/format';

const ALL_TEMPERAMENTS: Temperament[] = [
  'Joueur',
  'Calme',
  'Sociable',
  'Timide',
  'Dominant',
  'Énergique',
];
const ALL_PLACES: MeetingPlace[] = ['Parc', 'Appartement', "Cour d'immeuble"];

export default function ProfileScreen() {
  const { profile, matches, likesReceived, updateProfile } = useApp();
  const { enabled: soundEnabled, toggle: toggleSound } = useSound();
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(profile.bio);
  const [heroIndex, setHeroIndex] = useState(0);
  const [lightbox, setLightbox] = useState<ImageSourcePropType | null>(null);

  const gallery = profile.photos.length > 0 ? profile.photos : [profile.photo];
  const hero = gallery[Math.min(heroIndex, gallery.length - 1)];
  const { pct, missing } = profileCompletion(profile);

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={styles.title}>👤 Mon profil</Text>

          <View style={styles.headerCard}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => setLightbox(hero)}>
              <Image source={hero} style={styles.hero} resizeMode="cover" />
              <View style={styles.heroHint}>
                <Ionicons name="expand" size={13} color="#fff" />
              </View>
            </TouchableOpacity>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbStrip}
              contentContainerStyle={styles.thumbRow}
            >
              {gallery.map((p, i) => (
                <TouchableOpacity key={i} onPress={() => setHeroIndex(i)} activeOpacity={0.8}>
                  <Image
                    source={p}
                    style={[styles.thumb, i === heroIndex && styles.thumbActive]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.nameRow}>
              <Text style={styles.name}>
                {profile.name}, {ageLabel(profile.age)}
              </Text>
              {profile.verified && <VerifiedBadge size={19} />}
              <Text style={styles.sex}>{profile.sex === 'M' ? '♂' : '♀'}</Text>
            </View>
            <Text style={styles.type}>
              {profile.breed} · {profile.type}
            </Text>
          </View>

          {/* Complétion du profil */}
          <View style={styles.completion}>
            <View style={styles.completionHead}>
              <Text style={styles.completionTitle}>Profil complété à {pct} %</Text>
              {missing.length === 0 && (
                <Ionicons name="checkmark-circle" size={17} color={colors.like} />
              )}
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>
            {missing.length > 0 && (
              <Text style={styles.completionHint}>
                Prochaine étape : {missing[0].toLowerCase()} — les profils complets reçoivent 3×
                plus de likes.
              </Text>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <Stat emoji="❤️" value={profile.stats.likes + likesReceived.length} label="likes" />
            <Stat emoji="👁️" value={profile.stats.views} label="vues" />
            <Stat emoji="💬" value={matches.length} label="matches" />
          </View>

          {/* Bio */}
          <Section title="À propos">
            {editingBio ? (
              <View>
                <TextInput
                  style={styles.bioInput}
                  value={bioDraft}
                  onChangeText={setBioDraft}
                  multiline
                  autoFocus
                  maxLength={300}
                />
                <View style={styles.bioActions}>
                  <Text style={styles.counter}>{bioDraft.length}/300</Text>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => {
                      updateProfile({ bio: bioDraft });
                      setEditingBio(false);
                    }}
                  >
                    <Text style={styles.saveBtnText}>Enregistrer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setEditingBio(true)}>
                <Text style={styles.bio}>{profile.bio}</Text>
                <Text style={styles.editHint}>
                  <Ionicons name="pencil" size={12} /> Toucher pour modifier
                </Text>
              </TouchableOpacity>
            )}
          </Section>

          {/* Tempérament */}
          <Section title="Tempérament">
            <View style={styles.tagsRow}>
              {ALL_TEMPERAMENTS.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  active={profile.temperaments.includes(t)}
                  onPress={() =>
                    updateProfile({ temperaments: toggle(profile.temperaments, t) })
                  }
                />
              ))}
            </View>
          </Section>

          {/* Lieu de rencontre préféré */}
          <Section title="Lieu de rencontre préféré">
            <Text style={styles.sectionHint}>
              Où {profile.name} est le plus à l'aise pour rencontrer un autre chat.
            </Text>
            <View style={styles.tagsRow}>
              {ALL_PLACES.map((p) => (
                <Chip
                  key={p}
                  label={p}
                  icon={placeIcon(p)}
                  active={profile.meetingPlaces.includes(p)}
                  onPress={() =>
                    updateProfile({ meetingPlaces: toggle(profile.meetingPlaces, p) })
                  }
                />
              ))}
            </View>
          </Section>

          {/* Santé */}
          <Section title="Santé">
            <View style={styles.healthCard}>
              <HealthRow
                label="Vacciné"
                value={profile.health.vaccinated}
                onChange={(v) => updateProfile({ health: { ...profile.health, vaccinated: v } })}
              />
              <HealthRow
                label="Stérilisé"
                value={profile.health.sterilized}
                onChange={(v) => updateProfile({ health: { ...profile.health, sterilized: v } })}
              />
              <HealthRow
                label="Pucé"
                value={profile.health.chipped}
                onChange={(v) => updateProfile({ health: { ...profile.health, chipped: v } })}
                last
              />
            </View>
          </Section>

          {/* Préférences */}
          <Section title="Préférences">
            <View style={styles.healthCard}>
              <HealthRow
                label="Ronronnement au match"
                value={soundEnabled}
                onChange={toggleSound}
                last
              />
            </View>
            <Text style={styles.sectionHint}>
              Le petit ronron qui accompagne la pluie de chats quand ça matche.
            </Text>
          </Section>

          {/* Contact */}
          <Section title="Mon contact">
            <View style={styles.contactCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{profile.owner.name}</Text>
                <Text style={styles.contactPhone}>{maskPhone(profile.owner.phone)}</Text>
              </View>
              <Ionicons name="lock-closed" size={17} color={colors.textLight} />
            </View>
            <Text style={styles.sectionHint}>
              Ton numéro n'est jamais affiché en clair aux autres utilisateurs, même après un
              match. Tu le partages toi-même dans le chat si tu le souhaites.
            </Text>
          </Section>

          {/* Premium */}
          <View style={styles.premiumCard}>
            <View style={styles.premiumHead}>
              <Ionicons name="diamond" size={19} color={colors.gold} />
              <Text style={styles.premiumTitle}>CatMatch Premium</Text>
            </View>
            {[
              'Swipes illimités',
              "Voir qui t'a liké sans flou",
              'Super likes illimités',
              'Remonter dans le quartier une fois par semaine',
              'Sans publicité',
            ].map((line) => (
              <View key={line} style={styles.premiumLine}>
                <Ionicons name="checkmark" size={14} color={colors.gold} />
                <Text style={styles.premiumText}>{line}</Text>
              </View>
            ))}
            <PrimaryButton
              label="2,99 €/mois — Bientôt disponible"
              tone="gold"
              style={{ marginTop: spacing.m }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Photo en plein écran */}
      <Modal
        visible={!!lightbox}
        transparent
        animationType="fade"
        onRequestClose={() => setLightbox(null)}
      >
        <Pressable style={styles.lightbox} onPress={() => setLightbox(null)}>
          {lightbox && <Image source={lightbox} style={styles.lightboxImage} resizeMode="contain" />}
          <View style={styles.lightboxClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {emoji} {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function HealthRow({
  label,
  value,
  onChange,
  last,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.healthRow, !last && styles.healthRowBorder]}>
      <Text style={styles.healthLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.like, false: colors.border }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: spacing.xl, alignItems: 'center' },
  content: { width: '100%', maxWidth: CONTENT_MAX_W },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.primary,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  headerCard: { alignItems: 'center' },
  hero: {
    width: Math.min(Dimensions.get('window').width, CONTENT_MAX_W) - spacing.l * 2,
    // Hauteur bornée pour que le nom et la bio restent visibles sans scroller.
    height: Math.min(320, Dimensions.get('window').height * 0.42),
    borderRadius: radius.l,
    backgroundColor: colors.border,
  },
  heroHint: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbStrip: { alignSelf: 'stretch' },
  thumbRow: { gap: spacing.s, paddingHorizontal: spacing.l, paddingVertical: spacing.s },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.s,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.border,
  },
  thumbActive: { borderColor: colors.primary },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.s },
  name: { fontSize: 24, fontWeight: '800', color: colors.text },
  sex: { fontSize: 19, color: colors.textLight },
  type: { fontSize: 14, color: colors.textLight, marginTop: 2 },
  completion: {
    marginHorizontal: spacing.l,
    marginTop: spacing.l,
    backgroundColor: colors.card,
    borderRadius: radius.m,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  completionTitle: { fontWeight: '700', color: colors.text, fontSize: 14.5 },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginTop: spacing.s,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary },
  completionHint: { fontSize: 12.5, color: colors.textLight, marginTop: spacing.s, lineHeight: 18 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: spacing.l },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  section: { paddingHorizontal: spacing.l, marginBottom: spacing.l },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.s },
  sectionHint: { fontSize: 12.5, color: colors.textLight, marginBottom: spacing.s, lineHeight: 18 },
  bio: { fontSize: 15, color: colors.text, lineHeight: 22 },
  editHint: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  bioInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    padding: spacing.m,
    fontSize: 15,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bioActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.s,
  },
  counter: { fontSize: 12, color: colors.textLight },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s },
  healthCard: {
    backgroundColor: colors.card,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.m,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.s + 2,
  },
  healthRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  healthLabel: { fontSize: 15, color: colors.text, fontWeight: '600' },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.m,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.s,
  },
  contactName: { fontWeight: '700', color: colors.text, fontSize: 15 },
  contactPhone: { color: colors.textLight, fontSize: 14, marginTop: 2, letterSpacing: 1 },
  premiumCard: {
    marginHorizontal: spacing.l,
    backgroundColor: colors.goldSoft,
    borderRadius: radius.m,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: '#F5E0B8',
    ...shadow.soft,
  },
  premiumHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  premiumTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  premiumLine: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: spacing.s },
  premiumText: { fontSize: 14, color: colors.text },
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImage: { width: '100%', height: '80%' },
  lightboxClose: { position: 'absolute', top: 40, right: 24 },
});
