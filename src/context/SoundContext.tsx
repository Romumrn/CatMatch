import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

const PURR = require('../../assets/sounds/purr.mp3');

interface SoundState {
  enabled: boolean;
  toggle: () => void;
  playPurr: () => void;
}

const SoundContext = createContext<SoundState | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const player = useAudioPlayer(PURR);
  const [enabled, setEnabled] = useState(true);

  /**
   * Safari mobile n'autorise un son que s'il part d'un geste. Or un match issu
   * d'un swipe joue le ronron ~230 ms après le relâchement, dans le callback
   * d'animation — trop tard. On déverrouille donc l'élément audio au tout
   * premier appui, dans un vrai gestionnaire de geste : ensuite il est libre
   * pour le reste de la session.
   */
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const unlock = () => {
      try {
        player.volume = 0;
        player.play();
        player.pause();
        player.seekTo(0);
      } catch {
        // Navigateur récalcitrant : on réessaiera au premier match.
      }
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, [player]);

  /**
   * À appeler directement depuis le geste de l'utilisateur (onPress, fin de
   * swipe) : sur mobile web, un navigateur refuse de démarrer un son qui n'est
   * pas déclenché par une interaction.
   */
  const playPurr = useCallback(() => {
    if (!enabled) return;
    try {
      player.volume = 0.85;
      // expo-audio ne rembobine pas tout seul en fin de lecture.
      player.seekTo(0);
      player.play();
    } catch {
      // Un navigateur qui bloque la lecture ne doit pas casser le match.
    }
  }, [enabled, player]);

  const toggle = useCallback(() => {
    setEnabled((e) => {
      if (e) {
        try {
          player.pause();
        } catch {
          /* rien à faire */
        }
      }
      return !e;
    });
  }, [player]);

  const value = useMemo(() => ({ enabled, toggle, playPurr }), [enabled, toggle, playPurr]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundState {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound doit être utilisé dans <SoundProvider>');
  return ctx;
}
