import { ImageSourcePropType } from 'react-native';

export type Temperament =
  | 'Joueur'
  | 'Calme'
  | 'Sociable'
  | 'Timide'
  | 'Dominant'
  | 'Énergique';

export type CatType = 'Intérieur' | 'Extérieur' | 'Semi-outdoor';

/** Les trois seuls lieux de rencontre proposés. */
export type MeetingPlace = 'Parc' | 'Appartement' | "Cour d'immeuble";

export interface Health {
  vaccinated: boolean;
  sterilized: boolean;
  chipped: boolean;
}

export interface Owner {
  name: string;
  /** Jamais affiché en clair : passer par maskPhone(). */
  phone?: string;
}

export interface Cat {
  id: string;
  name: string;
  age: number; // années
  sex: 'M' | 'F';
  breed: string;
  temperaments: Temperament[];
  type: CatType;
  meetingPlaces: MeetingPlace[];
  distanceM: number; // distance en mètres
  photos: ImageSourcePropType[];
  bio: string;
  health: Health;
  /** Profil vérifié par l'équipe (photo = vrai chat). */
  verified: boolean;
  /** Dernière activité, en minutes. */
  lastActiveMin: number;
  owner: Owner;
}

export interface Message {
  id: string;
  from: 'me' | 'them';
  text: string;
  at: number;
  readAt?: number;
}

export interface Match {
  cat: Cat;
  matchedAt: number;
  messages: Message[];
  /** Passe à true dès que la conversation est ouverte. */
  seen: boolean;
  /** Le like de départ était un super like. */
  superLike: boolean;
}

export interface MyCatProfile {
  name: string;
  age: number;
  sex: 'M' | 'F';
  breed: string;
  temperaments: Temperament[];
  type: CatType;
  meetingPlaces: MeetingPlace[];
  bio: string;
  photo: ImageSourcePropType;
  photos: ImageSourcePropType[];
  health: Health;
  verified: boolean;
  owner: Owner;
  stats: { likes: number; views: number };
}

export interface Filters {
  radiusM: number;
  ageRange: [number, number];
  sex: 'M' | 'F' | 'Tous';
  meetingPlaces: MeetingPlace[];
  temperaments: Temperament[];
  verifiedOnly: boolean;
}

/** Un like reçu, pas encore rendu (écran « Likes reçus »). */
export interface ReceivedLike {
  cat: Cat;
  at: number;
  superLike: boolean;
}
