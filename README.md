# 🐱 CatMatch

**"Tinder pour chats"** — app mobile React Native (Expo) pour socialiser les chats du quartier.

## Lancer l'app

```bash
npm install
npm start          # QR code Expo Go (iPhone/Android)
npm run web        # version web de test sur http://localhost:8081
npm run android    # émulateur Android
npm run ios        # simulateur iOS (macOS)
```

Le plus simple pour tester sur téléphone : installer **Expo Go** (App Store / Play Store), lancer `npm start` et scanner le QR code.

## Ce qui est implémenté (MVP)

- **Découvrir** : deck de swipe façon Tinder (glisser à droite = like, gauche = passe), boutons d'action, tampons animés « J'AIME / PASSE », fiche détaillée du chat (bio, propriétaire), compteur de 50 swipes/jour (version gratuite).
- **Match** : écran « C'est un match ! 🎉 » avec révélation du contact du propriétaire (le téléphone reste caché avant match).
- **Matches** : liste des conversations avec badge sur l'onglet.
- **Chat** : messagerie par match, messages templates rapides, réponse automatique de démo.
- **Profil** : photo, stats (likes/vues/matches), bio éditable, tempéraments et rayon de recherche modifiables, bannière Premium (2,99 €/mois).

Les chats affichés sont des **données de démo locales** ([src/data/cats.ts](src/data/cats.ts)) avec photos placecats.com.

## Structure

```
App.tsx                      # navigation (3 onglets + stack chat)
src/
  theme.ts                   # couleurs / espacements
  types.ts                   # types Cat, Match, Message, profil
  data/cats.ts               # données de démo
  context/AppContext.tsx     # état global (deck, matches, messages, profil)
  components/SwipeDeck.tsx   # cartes swipeables (PanResponder + Animated)
  screens/                   # Discover, Matches, Chat, Profile
```

## Prochaines étapes (cf. spec)

1. **Firebase** : Auth (SMS), Firestore (profils, matches), Storage (photos/vidéos), Cloud Functions (matching réel à double like).
2. **Géolocalisation réelle** : `expo-location` est déjà installé — remplacer les distances de démo par un geohash + rayon.
3. **Vidéos** : upload 3×30 s, thumbnails, player (expo-av / expo-video).
4. **Premium** : paywall Stripe / RevenueCat, swipes illimités, « qui t'a liké ».
5. **Modération** : vérification photo (vrai chat), report/block, guidelines.
