import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

export function Chip({
  label,
  active,
  onPress,
  tone = 'primary',
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  tone?: 'primary' | 'neutral' | 'like';
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const accent =
    tone === 'like' ? colors.like : tone === 'neutral' ? colors.textLight : colors.primary;
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        active && { backgroundColor: accent, borderColor: accent },
        !active && onPress && { borderColor: colors.border },
      ]}
    >
      {icon && (
        <Ionicons name={icon} size={13} color={active ? '#fff' : accent} style={{ marginRight: 4 }} />
      )}
      <Text style={[styles.chipText, active && styles.chipTextActive, !active && { color: accent }]}>
        {label}
      </Text>
    </Wrapper>
  );
}

export function VerifiedBadge({ size = 15 }: { size?: number }) {
  return <Ionicons name="checkmark-circle" size={size} color={colors.verified} />;
}

export function Section({
  title,
  action,
  children,
  style,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

export function EmptyState({
  emoji,
  title,
  text,
  cta,
}: {
  emoji: string;
  title: string;
  text: string;
  cta?: React.ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      {cta}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  tone = 'primary',
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'primary' | 'gold' | 'ghost';
  style?: StyleProp<ViewStyle>;
}) {
  const bg = tone === 'gold' ? colors.gold : tone === 'ghost' ? 'transparent' : colors.primary;
  const fg = tone === 'gold' ? colors.text : tone === 'ghost' ? colors.textLight : '#fff';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.btn, { backgroundColor: bg }, tone === 'ghost' && styles.btnGhost, style]}
    >
      {icon && <Ionicons name={icon} size={17} color={fg} style={{ marginRight: 6 }} />}
      <Text style={[styles.btnText, { color: fg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  chipText: { fontWeight: '600', fontSize: 13.5 },
  chipTextActive: { color: '#fff' },
  section: { paddingHorizontal: spacing.l, marginBottom: spacing.l },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.s,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 19, fontWeight: '800', color: colors.text, textAlign: 'center' },
  emptyText: {
    fontSize: 15,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.l,
    paddingVertical: 13,
  },
  btnGhost: { paddingVertical: 8 },
  btnText: { fontWeight: '700', fontSize: 15.5 },
});
