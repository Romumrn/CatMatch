import React from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { MeetingPlace, Temperament } from '../types';
import { colors, radius, spacing, CONTENT_MAX_W } from '../theme';
import { Chip, PrimaryButton } from '../components/ui';
import { placeIcon } from '../components/CatDetailSheet';
import { formatDistance } from '../utils/format';

const RADIUS_OPTIONS = [300, 500, 1000, 2000];
const AGE_PRESETS: [number, number][] = [
  [1, 2],
  [1, 5],
  [3, 8],
  [1, 12],
];
const ALL_PLACES: MeetingPlace[] = ['Parc', 'Appartement', "Cour d'immeuble"];
const ALL_TEMPERAMENTS: Temperament[] = [
  'Joueur',
  'Calme',
  'Sociable',
  'Timide',
  'Dominant',
  'Énergique',
];

export default function FiltersSheet({
  visible,
  onClose,
  resultCount,
}: {
  visible: boolean;
  onClose: () => void;
  resultCount: number;
}) {
  const { filters, updateFilters, resetFilters } = useApp();

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filtres</Text>
          <TouchableOpacity onPress={resetFilters} hitSlop={10}>
            <Text style={styles.reset}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <Group title="Distance maximale" value={formatDistance(filters.radiusM)}>
              <View style={styles.row}>
                {RADIUS_OPTIONS.map((r) => (
                  <Chip
                    key={r}
                    label={formatDistance(r)}
                    active={filters.radiusM === r}
                    onPress={() => updateFilters({ radiusM: r })}
                  />
                ))}
              </View>
            </Group>

            <Group
              title="Âge"
              value={
                filters.ageRange[1] >= 12
                  ? `${filters.ageRange[0]} an et +`
                  : `${filters.ageRange[0]} – ${filters.ageRange[1]} ans`
              }
            >
              <View style={styles.row}>
                {AGE_PRESETS.map(([a, b]) => (
                  <Chip
                    key={`${a}-${b}`}
                    label={b >= 12 ? `${a} an et +` : `${a} – ${b} ans`}
                    active={filters.ageRange[0] === a && filters.ageRange[1] === b}
                    onPress={() => updateFilters({ ageRange: [a, b] })}
                  />
                ))}
              </View>
            </Group>

            <Group title="Sexe">
              <View style={styles.row}>
                {(['Tous', 'M', 'F'] as const).map((s) => (
                  <Chip
                    key={s}
                    label={s === 'M' ? 'Mâle ♂' : s === 'F' ? 'Femelle ♀' : 'Tous'}
                    active={filters.sex === s}
                    onPress={() => updateFilters({ sex: s })}
                  />
                ))}
              </View>
            </Group>

            <Group
              title="Lieu de rencontre"
              hint="Aucun sélectionné = tous les lieux"
            >
              <View style={styles.row}>
                {ALL_PLACES.map((p) => (
                  <Chip
                    key={p}
                    label={p}
                    icon={placeIcon(p)}
                    active={filters.meetingPlaces.includes(p)}
                    onPress={() => updateFilters({ meetingPlaces: toggle(filters.meetingPlaces, p) })}
                  />
                ))}
              </View>
            </Group>

            <Group title="Tempérament" hint="Aucun sélectionné = tous les tempéraments">
              <View style={styles.row}>
                {ALL_TEMPERAMENTS.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    active={filters.temperaments.includes(t)}
                    onPress={() => updateFilters({ temperaments: toggle(filters.temperaments, t) })}
                  />
                ))}
              </View>
            </Group>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Profils vérifiés uniquement</Text>
                <Text style={styles.switchHint}>
                  Photo confirmée par notre équipe : c'est bien un vrai chat.
                </Text>
              </View>
              <Switch
                value={filters.verifiedOnly}
                onValueChange={(v) => updateFilters({ verifiedOnly: v })}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={
              resultCount === 0
                ? 'Aucun chat ne correspond'
                : `Voir ${resultCount} chat${resultCount > 1 ? 's' : ''}`
            }
            onPress={onClose}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function Group({
  title,
  value,
  hint,
  children,
}: {
  title: string;
  value?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <View style={styles.groupHead}>
        <Text style={styles.groupTitle}>{title}</Text>
        {value && <Text style={styles.groupValue}>{value}</Text>}
      </View>
      {hint && <Text style={styles.groupHint}>{hint}</Text>}
      {children}
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  reset: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  scroll: { alignItems: 'center', paddingVertical: spacing.l },
  content: { width: '100%', maxWidth: CONTENT_MAX_W, paddingHorizontal: spacing.l },
  group: { marginBottom: spacing.xl },
  groupHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  groupTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  groupValue: { fontSize: 14, color: colors.primary, fontWeight: '700' },
  groupHint: { fontSize: 12.5, color: colors.textLight, marginTop: 2, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.s },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radius.m,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchLabel: { fontWeight: '700', color: colors.text, fontSize: 15 },
  switchHint: { color: colors.textLight, fontSize: 12.5, marginTop: 3, lineHeight: 17 },
  footer: {
    padding: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
});
