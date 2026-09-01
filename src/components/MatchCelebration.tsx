import React from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Match, MyCatProfile } from '../types';
import { colors, radius, spacing } from '../theme';
import { PrimaryButton } from './ui';
import EmojiRain from './EmojiRain';
import { compatibility } from '../utils/format';

interface Props {
  match: Match | null;
  profile: MyCatProfile;
  onClose: () => void;
  onOpenChat: (catId: string) => void;
}

export default function MatchCelebration({ match, profile, onClose, onOpenChat }: Props) {
  return (
    <Modal visible={!!match} animationType="fade" transparent onRequestClose={onClose}>
      {match && (
        <View style={styles.overlay}>
          {/* Derrière la carte : la pluie reste bien visible autour sans
              passer par-dessus le texte du match. Une clé neuve à chaque
              match force le remontage, donc une nouvelle pluie. */}
          <EmojiRain key={match.cat.id + match.matchedAt} active />

          <View style={styles.card}>
            <Text style={styles.kicker}>
              {match.superLike ? 'SUPER LIKE RENDU' : 'VOUS VOUS ÊTES LIKÉS'}
            </Text>
            <Text style={[styles.title, match.superLike && { color: colors.superLike }]}>
              C'est un match ! 🎉
            </Text>

            <View style={styles.photos}>
              <Image source={profile.photo} style={[styles.photo, { marginRight: -18 }]} />
              <View style={[styles.heart, match.superLike && { backgroundColor: colors.superLike }]}>
                <Ionicons name={match.superLike ? 'star' : 'heart'} size={17} color="#fff" />
              </View>
              <Image source={match.cat.photos[0]} style={[styles.photo, { marginLeft: -18 }]} />
            </View>

            <Text style={styles.text}>
              {profile.name} et {match.cat.name} pourraient devenir copains — vous avez{' '}
              {compatibility(profile, match.cat)} % d'affinité.
            </Text>
            <Text style={styles.sub}>
              Le contact de {match.cat.owner.name} reste masqué : écrivez-vous d'abord ici.
            </Text>

            <PrimaryButton
              label="Envoyer un message"
              icon="chatbubble"
              style={{ alignSelf: 'stretch', marginTop: spacing.l }}
              onPress={() => onOpenChat(match.cat.id)}
            />
            <TouchableOpacity onPress={onClose} style={{ padding: spacing.s }}>
              <Text style={styles.later}>Continuer à swiper</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.l,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    padding: spacing.l,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  kicker: { fontSize: 11, fontWeight: '800', color: colors.textLight, letterSpacing: 1.4 },
  title: { fontSize: 27, fontWeight: '800', color: colors.primary, marginTop: 4 },
  photos: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.l },
  photo: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 4,
    borderColor: colors.card,
    backgroundColor: colors.border,
  },
  heart: {
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
  text: { fontSize: 15.5, color: colors.text, textAlign: 'center', lineHeight: 22 },
  sub: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: spacing.s,
  },
  later: { color: colors.textLight, marginTop: spacing.s, fontSize: 14, fontWeight: '600' },
});
