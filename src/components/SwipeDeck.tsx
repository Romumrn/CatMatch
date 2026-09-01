import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cat, MyCatProfile } from '../types';
import { colors, radius, shadow, spacing, CONTENT_MAX_W } from '../theme';
import { VerifiedBadge } from './ui';
import { placeIcon } from './CatDetailSheet';
import { ageLabel, compatibility, formatDistance, formatLastActive } from '../utils/format';

const { width: WINDOW_W } = Dimensions.get('window');
// Sur desktop (version web), on borne la carte pour garder un format mobile.
const SCREEN_W = Math.min(WINDOW_W, CONTENT_MAX_W);
const SWIPE_THRESHOLD = SCREEN_W * 0.28;
const SUPER_THRESHOLD = 110;

interface Props {
  cats: Cat[];
  profile: MyCatProfile;
  onLike: (cat: Cat) => void;
  onPass: (cat: Cat) => void;
  onSuperLike: (cat: Cat) => void;
  onOpenDetails: (cat: Cat) => void;
}

export default function SwipeDeck({
  cats,
  profile,
  onLike,
  onPass,
  onSuperLike,
  onOpenDetails,
}: Props) {
  const position = useRef(new Animated.ValueXY()).current;
  const [, forceRender] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const topCat = cats[0];
  const nextCat = cats[1];

  // Le PanResponder est créé une seule fois : on lit le deck via une ref.
  const catsRef = useRef(cats);
  catsRef.current = cats;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_W, 0, SCREEN_W],
    outputRange: ['-11deg', '0deg', '11deg'],
  });
  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const passOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const superOpacity = position.y.interpolate({
    inputRange: [-SUPER_THRESHOLD, -30],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  // La carte suivante reste à taille réelle tant que celle du dessus ne bouge
  // pas : sinon elle dépasse dans les coins arrondis de la carte du dessus.
  const nextScale = position.x.interpolate({
    inputRange: [-SCREEN_W, 0, SCREEN_W],
    outputRange: [1, 0.97, 1],
    extrapolate: 'clamp',
  });

  const finish = (cat: Cat, action: 'like' | 'pass' | 'super') => {
    position.setValue({ x: 0, y: 0 });
    setPhotoIndex(0);
    if (action === 'like') onLike(cat);
    else if (action === 'pass') onPass(cat);
    else onSuperLike(cat);
    forceRender((n) => n + 1);
  };

  const swipeOut = (action: 'like' | 'pass' | 'super', cat: Cat) => {
    const to =
      action === 'super'
        ? { x: 0, y: -900 }
        : { x: action === 'like' ? SCREEN_W * 1.5 : -SCREEN_W * 1.5, y: 0 };
    Animated.timing(position, { toValue: to, duration: 230, useNativeDriver: false }).start(() =>
      finish(cat, action)
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 6 || Math.abs(g.dy) > 12,
      onPanResponderMove: (_e, g) => position.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (_e, g) => {
        const cat = catsRef.current[0];
        if (!cat) return;
        if (g.dy < -SUPER_THRESHOLD && Math.abs(g.dx) < SWIPE_THRESHOLD) swipeOut('super', cat);
        else if (g.dx > SWIPE_THRESHOLD) swipeOut('like', cat);
        else if (g.dx < -SWIPE_THRESHOLD) swipeOut('pass', cat);
        else
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: false,
          }).start();
      },
    })
  ).current;

  if (!topCat) return null;

  return (
    <View style={styles.container}>
      <View style={styles.stack}>
        {nextCat && (
          <Animated.View
            style={[styles.card, styles.cardBehind, { transform: [{ scale: nextScale }] }]}
          >
            <CardContent cat={nextCat} profile={profile} photoIndex={0} />
          </Animated.View>
        )}

        <Animated.View
          key={topCat.id}
          {...panResponder.panHandlers}
          style={[
            styles.card,
            { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] },
          ]}
        >
          <CardContent
            cat={topCat}
            profile={profile}
            photoIndex={photoIndex}
            onPrevPhoto={() => setPhotoIndex((i) => Math.max(0, i - 1))}
            onNextPhoto={() => setPhotoIndex((i) => Math.min(topCat.photos.length - 1, i + 1))}
            onOpenDetails={() => onOpenDetails(topCat)}
          />
          <Animated.View
            style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}
            pointerEvents="none"
          >
            <Text style={[styles.stampText, { color: colors.like }]}>J'AIME</Text>
          </Animated.View>
          <Animated.View
            style={[styles.stamp, styles.stampPass, { opacity: passOpacity }]}
            pointerEvents="none"
          >
            <Text style={[styles.stampText, { color: colors.pass }]}>PASSE</Text>
          </Animated.View>
          <Animated.View
            style={[styles.stamp, styles.stampSuper, { opacity: superOpacity }]}
            pointerEvents="none"
          >
            <Text style={[styles.stampText, { color: colors.superLike }]}>SUPER LIKE</Text>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

function CardContent({
  cat,
  profile,
  photoIndex,
  onPrevPhoto,
  onNextPhoto,
  onOpenDetails,
}: {
  cat: Cat;
  profile: MyCatProfile;
  photoIndex: number;
  onPrevPhoto?: () => void;
  onNextPhoto?: () => void;
  onOpenDetails?: () => void;
}) {
  const score = compatibility(profile, cat);
  const online = cat.lastActiveMin < 5;

  return (
    <View style={styles.cardInner}>
      <Image source={cat.photos[photoIndex]} style={styles.photo} />

      {cat.photos.length > 1 && (
        <View style={styles.progressRow}>
          {cat.photos.map((_, i) => (
            <View key={i} style={[styles.progressBar, i === photoIndex && styles.progressBarActive]} />
          ))}
        </View>
      )}

      {onPrevPhoto && (
        <>
          <TouchableOpacity style={[styles.tapZone, { left: 0 }]} activeOpacity={1} onPress={onPrevPhoto} />
          <TouchableOpacity style={[styles.tapZone, { right: 0 }]} activeOpacity={1} onPress={onNextPhoto} />
        </>
      )}

      <View style={styles.scoreBadge}>
        <Ionicons name="sparkles" size={12} color={colors.primary} />
        <Text style={styles.scoreText}>{score} %</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {cat.name}, {ageLabel(cat.age)}
          </Text>
          {cat.verified && <VerifiedBadge size={17} />}
          <Text style={styles.sex}>{cat.sex === 'M' ? '♂' : '♀'}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.presence, online && { backgroundColor: colors.like }]} />
          <Text style={styles.meta}>{formatLastActive(cat.lastActiveMin)}</Text>
          <Text style={styles.meta}>·</Text>
          <Ionicons name="location" size={13} color={colors.primary} />
          <Text style={styles.meta}>{formatDistance(cat.distanceM)}</Text>
        </View>

        <View style={styles.tagsRow}>
          {cat.temperaments.slice(0, 3).map((t) => (
            <View
              key={t}
              style={[styles.tag, profile.temperaments.includes(t) && styles.tagShared]}
            >
              <Text
                style={[
                  styles.tagText,
                  profile.temperaments.includes(t) && { color: colors.like },
                ]}
              >
                {t}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.placesRow}>
          {cat.meetingPlaces.map((pl) => (
            <View key={pl} style={styles.place}>
              <Ionicons name={placeIcon(pl)} size={12} color={colors.textLight} />
              <Text style={styles.placeText}>{pl}</Text>
            </View>
          ))}
        </View>

        {onOpenDetails && (
          <TouchableOpacity style={styles.moreBtn} onPress={onOpenDetails}>
            <Text style={styles.moreText}>Voir le profil</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  stack: { flex: 1, width: SCREEN_W - spacing.l * 2 },
  card: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: radius.l,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  cardBehind: { opacity: 0.9 },
  cardInner: { flex: 1, borderRadius: radius.l, overflow: 'hidden' },
  photo: { flex: 1, width: '100%', backgroundColor: colors.border },
  progressRow: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', gap: 4 },
  progressBar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
  progressBarActive: { backgroundColor: '#fff' },
  tapZone: { position: 'absolute', top: 24, width: '32%', height: '55%' },
  scoreBadge: {
    position: 'absolute',
    top: 22,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  scoreText: { fontWeight: '800', fontSize: 12, color: colors.text },
  info: { padding: spacing.m, backgroundColor: colors.card },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 23, fontWeight: '800', color: colors.text, flexShrink: 1 },
  sex: { fontSize: 18, color: colors.textLight },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  presence: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textLight },
  meta: { fontSize: 13, color: colors.textLight },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagShared: { backgroundColor: colors.likeSoft },
  tagText: { color: colors.primaryDark, fontWeight: '600', fontSize: 12.5 },
  placesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  place: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  placeText: { fontSize: 12, color: colors.textLight, fontWeight: '600' },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 10 },
  moreText: { color: colors.primary, fontWeight: '700', fontSize: 13.5 },
  stamp: {
    position: 'absolute',
    top: 40,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 3.5,
    borderRadius: radius.s,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  stampLike: { left: 22, borderColor: colors.like, transform: [{ rotate: '-14deg' }] },
  stampPass: { right: 22, borderColor: colors.pass, transform: [{ rotate: '14deg' }] },
  stampSuper: {
    alignSelf: 'center',
    top: 'auto',
    bottom: 160,
    borderColor: colors.superLike,
  },
  stampText: { fontSize: 22, fontWeight: '900', letterSpacing: 1 },
});
