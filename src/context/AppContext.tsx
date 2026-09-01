import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Cat, Filters, Match, Message, MyCatProfile, ReceivedLike } from '../types';
import { DEMO_CATS, AUTO_REPLIES, INITIAL_LIKE_IDS } from '../data/cats';
import { matchesFilters } from '../utils/format';

const DAILY_SWIPE_LIMIT = 50; // version gratuite (cf. spec monétisation)
const DAILY_SUPER_LIKES = 3;

type SwipeAction = 'like' | 'pass' | 'super';

interface HistoryEntry {
  cat: Cat;
  action: SwipeAction;
  createdMatch: boolean;
}

interface AppState {
  deck: Cat[];
  matches: Match[];
  likesReceived: ReceivedLike[];
  filters: Filters;
  profile: MyCatProfile;
  swipesLeft: number;
  superLikesLeft: number;
  canUndo: boolean;
  unreadCount: number;
  newMatches: Match[];
  likeCat: (cat: Cat) => Match | null;
  superLikeCat: (cat: Cat) => Match | null;
  passCat: (cat: Cat) => void;
  undoSwipe: () => void;
  sendMessage: (catId: string, text: string) => void;
  markSeen: (catId: string) => void;
  unmatch: (catId: string) => void;
  reportCat: (catId: string) => void;
  updateFilters: (patch: Partial<Filters>) => void;
  resetFilters: () => void;
  updateProfile: (patch: Partial<MyCatProfile>) => void;
}

const DEFAULT_FILTERS: Filters = {
  radiusM: 2000,
  ageRange: [1, 12],
  sex: 'Tous',
  meetingPlaces: [],
  temperaments: [],
  verifiedOnly: false,
};

const DEFAULT_PROFILE: MyCatProfile = {
  name: 'Richard',
  age: 2,
  sex: 'M',
  breed: 'Européen noir',
  temperaments: ['Joueur', 'Sociable', 'Timide'],
  type: 'Intérieur',
  meetingPlaces: ['Appartement', "Cour d'immeuble"],
  bio: "Très joueur et très sociable une fois en confiance, mais un peu peureux dans les nouveaux environnements. Laissez-lui dix minutes pour renifler les lieux et il ne vous lâche plus. Cherche des copains patients près de chez lui !",
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
  health: { vaccinated: true, sterilized: true, chipped: true },
  verified: true,
  owner: { name: 'Romuald', phone: '06 34 27 81 09' },
  stats: { likes: 24, views: 156 },
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [swiped, setSwiped] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [likesReceived, setLikesReceived] = useState<ReceivedLike[]>(() =>
    INITIAL_LIKE_IDS.map((id, i) => ({
      cat: DEMO_CATS.find((c) => c.id === id)!,
      at: Date.now() - (i + 1) * 3600_000,
      superLike: i === 0,
    }))
  );
  const [blocked, setBlocked] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [profile, setProfile] = useState<MyCatProfile>(DEFAULT_PROFILE);
  const [swipesLeft, setSwipesLeft] = useState(DAILY_SWIPE_LIMIT);
  const [superLikesLeft, setSuperLikesLeft] = useState(DAILY_SUPER_LIKES);

  // Le deck est dérivé : filtres + chats déjà swipés + chats bloqués.
  const deck = useMemo(
    () =>
      DEMO_CATS.filter(
        (c) => !swiped.includes(c.id) && !blocked.includes(c.id) && matchesFilters(c, filters)
      ),
    [swiped, blocked, filters]
  );

  const consumeSwipe = (cat: Cat) => {
    setSwiped((s) => [...s, cat.id]);
    setSwipesLeft((s) => Math.max(0, s - 1));
  };

  /**
   * Démo : un chat sociable ou joueur rend le like. Un chat qui figure déjà
   * dans « Likes reçus » matche toujours — c'est le double like réel.
   */
  const wouldLikeBack = (cat: Cat, superLike: boolean) =>
    superLike ||
    likesReceived.some((l) => l.cat.id === cat.id) ||
    cat.temperaments.includes('Sociable') ||
    cat.temperaments.includes('Joueur');

  const registerLike = (cat: Cat, superLike: boolean): Match | null => {
    consumeSwipe(cat);
    setLikesReceived((ls) => ls.filter((l) => l.cat.id !== cat.id));

    if (!wouldLikeBack(cat, superLike)) {
      setHistory((h) => [{ cat, action: superLike ? 'super' : 'like', createdMatch: false }, ...h]);
      return null;
    }

    const hello: Message = {
      id: `${cat.id}-hello`,
      from: 'them',
      text: superLike
        ? `Oh, un super like ! ${cat.name} est très flatté·e 😻 On organise une rencontre ?`
        : `Salut ! ${cat.name} serait ravi·e de rencontrer ton chat. On organise une playdate ? 🐾`,
      at: Date.now(),
    };
    const match: Match = {
      cat,
      matchedAt: Date.now(),
      messages: [hello],
      seen: false,
      superLike,
    };
    setMatches((m) => [match, ...m]);
    setHistory((h) => [{ cat, action: superLike ? 'super' : 'like', createdMatch: true }, ...h]);
    return match;
  };

  const likeCat = (cat: Cat) => registerLike(cat, false);

  const superLikeCat = (cat: Cat) => {
    if (superLikesLeft <= 0) return likeCat(cat);
    setSuperLikesLeft((n) => n - 1);
    return registerLike(cat, true);
  };

  const passCat = (cat: Cat) => {
    consumeSwipe(cat);
    setHistory((h) => [{ cat, action: 'pass', createdMatch: false }, ...h]);
  };

  const undoSwipe = () => {
    const [last, ...rest] = history;
    if (!last) return;
    setHistory(rest);
    setSwiped((s) => s.filter((id) => id !== last.cat.id));
    setSwipesLeft((s) => Math.min(DAILY_SWIPE_LIMIT, s + 1));
    if (last.action === 'super') setSuperLikesLeft((n) => Math.min(DAILY_SUPER_LIKES, n + 1));
    if (last.createdMatch) setMatches((m) => m.filter((x) => x.cat.id !== last.cat.id));
  };

  const sendMessage = (catId: string, text: string) => {
    const mine: Message = { id: `${Date.now()}-me`, from: 'me', text, at: Date.now() };
    setMatches((ms) =>
      ms.map((m) => (m.cat.id === catId ? { ...m, messages: [...m.messages, mine] } : m))
    );
    // Réponse automatique de démo : accusé de lecture puis message.
    const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    setTimeout(() => {
      setMatches((ms) =>
        ms.map((m) =>
          m.cat.id === catId
            ? {
                ...m,
                messages: m.messages.map((msg) =>
                  msg.id === mine.id ? { ...msg, readAt: Date.now() } : msg
                ),
              }
            : m
        )
      );
    }, 900);
    setTimeout(() => {
      const theirs: Message = {
        id: `${Date.now()}-them`,
        from: 'them',
        text: reply,
        at: Date.now(),
      };
      setMatches((ms) =>
        ms.map((m) => (m.cat.id === catId ? { ...m, messages: [...m.messages, theirs] } : m))
      );
    }, 2400);
  };

  const markSeen = useCallback((catId: string) => {
    setMatches((ms) => ms.map((m) => (m.cat.id === catId ? { ...m, seen: true } : m)));
  }, []);

  const unmatch = (catId: string) => {
    setMatches((ms) => ms.filter((m) => m.cat.id !== catId));
    setBlocked((b) => [...b, catId]);
  };

  const reportCat = (catId: string) => {
    setBlocked((b) => [...b, catId]);
    setMatches((ms) => ms.filter((m) => m.cat.id !== catId));
    setLikesReceived((ls) => ls.filter((l) => l.cat.id !== catId));
  };

  const updateFilters = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);
  const updateProfile = (patch: Partial<MyCatProfile>) => setProfile((p) => ({ ...p, ...patch }));

  const newMatches = useMemo(() => matches.filter((m) => !m.seen), [matches]);
  const unreadCount = newMatches.length;

  const value = useMemo(
    () => ({
      deck,
      matches,
      likesReceived,
      filters,
      profile,
      swipesLeft,
      superLikesLeft,
      canUndo: history.length > 0,
      unreadCount,
      newMatches,
      likeCat,
      superLikeCat,
      passCat,
      undoSwipe,
      sendMessage,
      markSeen,
      unmatch,
      reportCat,
      updateFilters,
      resetFilters,
      updateProfile,
    }),
    [deck, matches, likesReceived, filters, profile, swipesLeft, superLikesLeft, history, unreadCount, newMatches, markSeen]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans <AppProvider>');
  return ctx;
}
