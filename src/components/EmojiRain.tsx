import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';

const EMOJIS = ['🐱', '😻', '😸', '🐾', '😺', '🐈', '💖', '🐈‍⬛'];
const COUNT = 34;
const DURATION = 5200;

interface Flake {
  emoji: string;
  x: number; // 0–1, position horizontale de départ
  size: number;
  delay: number; // 0–1, décalage dans l'animation globale
  span: number; // 0–1, durée de la chute
  drift: number; // amplitude du balancement latéral, en px
  spin: number; // tours effectués pendant la chute
}

/**
 * Pluie d'emojis chats, façon neige, pour l'écran de match.
 *
 * Une seule valeur animée pilote les 34 emojis, chacun lisant sa propre
 * tranche via interpolate() : animer 34 valeurs séparées en JavaScript fait
 * tomber le framerate sur mobile.
 */
export default function EmojiRain({ active }: { active: boolean }) {
  const progress = useRef(new Animated.Value(0)).current;
  const { height, width } = useWindowDimensions();

  const flakes = useMemo<Flake[]>(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        emoji: EMOJIS[i % EMOJIS.length],
        x: Math.random(),
        size: 20 + Math.random() * 26,
        delay: Math.random() * 0.5,
        span: 0.42 + Math.random() * 0.3,
        drift: (Math.random() * 2 - 1) * 55,
        spin: (Math.random() * 2 - 1) * 1.4,
      })),
    // Une nouvelle pluie à chaque match : la clé du composant change côté appelant.
    []
  );

  useEffect(() => {
    if (!active) return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: DURATION,
      easing: Easing.linear,
      // react-native-web n'a pas de moteur natif : tout passe par le JS.
      useNativeDriver: false,
    }).start();
  }, [active, progress]);

  if (!active) return null;

  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
      {flakes.map((f, i) => {
        const start = f.delay;
        const end = Math.min(1, f.delay + f.span);
        const clamp = { extrapolate: 'clamp' as const };

        const translateY = progress.interpolate({
          inputRange: [start, end],
          outputRange: [-70, height + 70],
          ...clamp,
        });
        const translateX = progress.interpolate({
          inputRange: [start, (start + end) / 2, end],
          outputRange: [0, f.drift, 0],
          ...clamp,
        });
        const rotate = progress.interpolate({
          inputRange: [start, end],
          outputRange: ['0deg', `${f.spin * 360}deg`],
          ...clamp,
        });
        const opacity = progress.interpolate({
          inputRange: [start, start + 0.05, end - 0.12, end],
          outputRange: [0, 1, 1, 0],
          ...clamp,
        });

        return (
          <Animated.Text
            key={i}
            style={[
              styles.flake,
              {
                left: f.x * width,
                fontSize: f.size,
                opacity,
                transform: [{ translateY }, { translateX }, { rotate }],
              },
            ]}
          >
            {f.emoji}
          </Animated.Text>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flake: { position: 'absolute', top: 0 },
});
