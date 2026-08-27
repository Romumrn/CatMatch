import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Temperament } from '../types';
import { colors, radius, spacing } from '../theme';

const ALL_TEMPERAMENTS: Temperament[] = [
  'Joueur',
  'Calme',
  'Sociable',
  'Timide',
  'Dominant',
  'Énergique',
];
const RADIUS_OPTIONS = [300, 500, 1000, 2000];

export default function ProfileScreen() {
  const { profile, matches, updateProfile } = useApp();
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(profile.bio);

  const toggleTemperament = (t: Temperament) => {
    const has = profile.temperaments.includes(t);
    updateProfile({
      temperaments: has
        ? profile.temperaments.filter((x) => x !== t)
        : [...profile.temperaments, t],
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Text style={styles.title}>👤 Mon profil</Text>

        <View style={styles.headerCard}>
          <Image source={{ uri: profile.photo }} style={styles.photo} />
          <Text style={styles.name}>
            {profile.name}, {profile.age} an{profile.age > 1 ? 's' : ''}{' '}
            {profile.sex === 'M' ? '♂' : '♀'}
          </Text>
          <Text style={styles.type}>{profile.type}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Stat emoji="❤️" value={profile.stats.likes} label="likes" />
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
              />
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
            {ALL_TEMPERAMENTS.map((t) => {
              const active = profile.temperaments.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.tag, active && styles.tagActive]}
                  onPress={() => toggleTemperament(t)}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Rayon de recherche */}
        <Section title="Rayon de recherche">
          <View style={styles.tagsRow}>
            {RADIUS_OPTIONS.map((r) => {
              const active = profile.radiusM === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.tag, active && styles.tagActive]}
                  onPress={() => updateProfile({ radiusM: r })}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>
                    {r < 1000 ? `${r} m` : `${r / 1000} km`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Premium */}
        <View style={styles.premiumCard}>
          <Text style={styles.premiumTitle}>💎 CatMatch Premium</Text>
          <Text style={styles.premiumText}>
            Swipes illimités · Voir qui t'a liké · Messages vidéo · Sans pub
          </Text>
          <TouchableOpacity style={styles.premiumBtn}>
            <Text style={styles.premiumBtnText}>2,99 €/mois — Bientôt disponible</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  headerCard: { alignItems: 'center' },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: spacing.s },
  type: { fontSize: 14, color: colors.textLight, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: spacing.l,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  section: { paddingHorizontal: spacing.l, marginBottom: spacing.l },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.s,
  },
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: spacing.s,
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s },
  tag: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tagActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { color: colors.text, fontWeight: '600', fontSize: 14 },
  tagTextActive: { color: '#fff' },
  premiumCard: {
    marginHorizontal: spacing.l,
    backgroundColor: '#FFF4DE',
    borderRadius: radius.m,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: '#F5E0B8',
  },
  premiumTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  premiumText: { fontSize: 14, color: colors.textLight, marginTop: 6, lineHeight: 20 },
  premiumBtn: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  premiumBtnText: { fontWeight: '800', color: colors.text },
});
