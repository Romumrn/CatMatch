import React, { createContext, useContext, useMemo, useState } from 'react';
import { Cat, Match, Message, MyCatProfile } from '../types';
import { DEMO_CATS, AUTO_REPLIES } from '../data/cats';

const DAILY_SWIPE_LIMIT = 50; // version gratuite (cf. spec monétisation)

interface AppState {
  deck: Cat[];
  matches: Match[];
  swipesLeft: number;
  profile: MyCatProfile;
  likeCat: (cat: Cat) => boolean; // retourne true si match
  passCat: (cat: Cat) => void;
  sendMessage: (catId: string, text: string) => void;
  updateProfile: (patch: Partial<MyCatProfile>) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [deck, setDeck] = useState<Cat[]>(DEMO_CATS);
  const [matches, setMatches] = useState<Match[]>([]);
  const [swipesLeft, setSwipesLeft] = useState(DAILY_SWIPE_LIMIT);
  const [profile, setProfile] = useState<MyCatProfile>({
    name: 'Richard',
    age: 2,
    sex: 'M',
    temperaments: ['Joueur', 'Sociable', 'Timide'],
    type: 'Intérieur',
    bio: "Très joueur et très sociable une fois en confiance, mais un peu peureux dans les nouveaux environnements. Cherche des copains patients pour jouer près de chez lui !",
    photo: require('../../assets/richard/richard-7.jpg'),
    photos: [
      require('../../assets/richard/richard-7.jpg'),
      require('../../assets/richard/richard-2.jpg'),
      require('../../assets/richard/richard-1.jpg'),
      require('../../assets/richard/richard-5.jpg'),
      require('../../assets/richard/richard-9.jpg'),
      require('../../assets/richard/richard-3.jpg'),
      require('../../assets/richard/richard-4.jpg'),
      require('../../assets/richard/richard-6.jpg'),
      require('../../assets/richard/richard-8.jpg'),
      require('../../assets/richard/richard-10.jpg'),
    ],
    radiusM: 1000,
    stats: { likes: 24, views: 156 },
  });

  const removeFromDeck = (id: string) =>
    setDeck((d) => d.filter((c) => c.id !== id));

  const likeCat = (cat: Cat): boolean => {
    removeFromDeck(cat.id);
    setSwipesLeft((s) => Math.max(0, s - 1));
    // Démo : les chats sociables/joueurs likent en retour → match.
    const isMatch =
      cat.temperaments.includes('Sociable') || cat.temperaments.includes('Joueur');
    if (isMatch) {
      const hello: Message = {
        id: `${cat.id}-hello`,
        from: 'them',
        text: `Salut ! ${cat.name} serait ravi·e de rencontrer ton chat. On organise une playdate ? 🐾`,
        at: Date.now(),
      };
      setMatches((m) => [{ cat, matchedAt: Date.now(), messages: [hello] }, ...m]);
    }
    return isMatch;
  };

  const passCat = (cat: Cat) => {
    removeFromDeck(cat.id);
    setSwipesLeft((s) => Math.max(0, s - 1));
  };

  const sendMessage = (catId: string, text: string) => {
    const mine: Message = { id: `${Date.now()}-me`, from: 'me', text, at: Date.now() };
    setMatches((ms) =>
      ms.map((m) => (m.cat.id === catId ? { ...m, messages: [...m.messages, mine] } : m))
    );
    // Réponse automatique de démo après un court délai.
    const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    setTimeout(() => {
      const theirs: Message = {
        id: `${Date.now()}-them`,
        from: 'them',
        text: reply,
        at: Date.now(),
      };
      setMatches((ms) =>
        ms.map((m) =>
          m.cat.id === catId ? { ...m, messages: [...m.messages, theirs] } : m
        )
      );
    }, 1500);
  };

  const updateProfile = (patch: Partial<MyCatProfile>) =>
    setProfile((p) => ({ ...p, ...patch }));

  const value = useMemo(
    () => ({ deck, matches, swipesLeft, profile, likeCat, passCat, sendMessage, updateProfile }),
    [deck, matches, swipesLeft, profile]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans <AppProvider>');
  return ctx;
}
