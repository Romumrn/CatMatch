import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cat } from '../types';
import { colors, radius, spacing } from '../theme';

const { width: WINDOW_W } = Dimensions.get('window');
// Sur desktop (version web), on borne la carte pour garder un format mobile.
const SCREEN_W = Math.min(WINDOW_W, 480);
const SWIPE_THRESHOLD = SCREEN_W * 0.3;

interface Props {
  cats: Cat[];
  onLike: (cat: Cat) => void;
  onPass: (cat: Cat) => void;
  onOpenDetails: (cat: Cat) => void;
}

export default function SwipeDeck({ cats, onLike, onPass, onOpenDetails }: Props) {
  const position = useRef(new Animated.ValueXY()).current;
  const [, forceRender] = useState(0);
  const topCat = cats[0];
  const nextCat = cats[1];

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_W, 0, SCREEN_W],
    outputRange: ['-12deg', '0deg', '12deg'],
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

  const swipeOut = (direction: 'left' | 'right', cat: Cat) => {
    Animated.timing(position, {
      toValue: { x: direction === 'right' ? SCREEN_W * 1.4 : -SCREEN_W * 1.4, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      direction === 'right' ? onLike(cat) : onPass(cat);
      forceRender((n) => n + 1);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_e, g) => position.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (_e, g) => {
        const cat = catsRef.current[0];
        if (!cat) return;
        if (g.dx > SWIPE_THRESHOLD) swipeOut('right', cat);
        else if (g.dx < -SWIPE_THRESHOLD) swipeOut('left', cat);
        else
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
      },
    })
  ).current;

  // Le PanResponder est créé une seule fois : on lit le deck via une ref.
  const catsRef = useRef(cats);
  catsRef.current = cats;

  if (!topCat) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>😿</Text>
        <Text style={styles.emptyTitle}>Plus de chats dans le coin…</Text>
        <Text style={styles.emptyText}>
          Élargis ton rayon de recherche dans ton profil, ou reviens plus tard !
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {nextCat && (
        <View style={[styles.card, styles.cardBehind]}>
          <CardContent cat={nextCat} />
        </View>
      )}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] },
        ]}
      >
        <TouchableOpacity activeOpacity={0.95} style={{ flex: 1 }} onPress={() => onOpenDetails(topCat)}>
          <CardContent cat={topCat} />
        </TouchableOpacity>
        <Animated.View style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}>
          <Text style={styles.stampText}>J'AIME ❤️</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampPass, { opacity: passOpacity }]}>
          <Text style={styles.stampText}>PASSE 👋</Text>
        </Animated.View>
      </Animated.View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.pass }]}
          onPress={() => swipeOut('left', topCat)}
        >
          <Ionicons name="close" size={32} color={colors.pass} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnBig, { borderColor: colors.like }]}
          onPress={() => swipeOut('right', topCat)}
        >
          <Ionicons name="heart" size={36} color={colors.like} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.gold }]}
          onPress={() => onOpenDetails(topCat)}
        >
          <Ionicons name="information" size={30} color={colors.gold} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CardContent({ cat }: { cat: Cat }) {
  return (
    <View style={styles.cardInner}>
      <Animated.Image source={{ uri: cat.photos[0] }} style={styles.photo} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {cat.name}, {cat.age} an{cat.age > 1 ? 's' : ''}
          </Text>
          <Text style={styles.sex}>{cat.sex === 'M' ? '♂' : '♀'}</Text>
        </View>
        <View style={styles.tagsRow}>
          {cat.temperaments.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
        <View style={styles.distanceRow}>
          <Ionicons name="location" size={14} color={colors.primary} />
          <Text style={styles.distance}>
            {cat.distanceM < 1000 ? `À ${cat.distanceM} m de toi` : `À ${(cat.distanceM / 1000).toFixed(1)} km de toi`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  card: {
    position: 'absolute',
    top: 0,
    width: SCREEN_W - spacing.l * 2,
    height: '78%',
    borderRadius: radius.l,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  cardBehind: { transform: [{ scale: 0.96 }, { translateY: 12 }] },
  cardInner: { flex: 1, borderRadius: radius.l, overflow: 'hidden' },
  photo: { flex: 1, width: '100%' },
  info: { padding: spacing.m, backgroundColor: colors.card },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 24, fontWeight: '700', color: colors.text },
  sex: { fontSize: 20, color: colors.textLight },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: {
    backgroundColor: '#FFEDE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: { color: colors.primaryDark, fontWeight: '600', fontSize: 13 },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  distance: { color: colors.textLight, fontSize: 14 },
  stamp: {
    position: 'absolute',
    top: 32,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.s,
    borderWidth: 3,
  },
  stampLike: { left: 20, borderColor: colors.like, transform: [{ rotate: '-12deg' }] },
  stampPass: { right: 20, borderColor: colors.pass, transform: [{ rotate: '12deg' }] },
  stampText: { fontSize: 20, fontWeight: '800', color: colors.text },
  actions: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.l,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  actionBtnBig: { width: 72, height: 72, borderRadius: 36 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.m },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.s },
  emptyText: { fontSize: 15, color: colors.textLight, textAlign: 'center' },
});
