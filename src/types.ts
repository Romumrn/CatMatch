import { ImageSourcePropType } from 'react-native';

export type Temperament =
  | 'Joueur'
  | 'Calme'
  | 'Sociable'
  | 'Timide'
  | 'Dominant'
  | 'Énergique';

export type CatType = 'Intérieur' | 'Extérieur' | 'Semi-outdoor';

export interface Cat {
  id: string;
  name: string;
  age: number; // années
  sex: 'M' | 'F';
  temperaments: Temperament[];
  type: CatType;
  distanceM: number; // distance en mètres
  photos: string[];
  bio: string;
  owner: {
    name: string;
    phone?: string;
    canHost: boolean;
    prefersOutside: boolean;
  };
}

export interface Message {
  id: string;
  from: 'me' | 'them';
  text: string;
  at: number;
}

export interface Match {
  cat: Cat;
  matchedAt: number;
  messages: Message[];
}

export interface MyCatProfile {
  name: string;
  age: number;
  sex: 'M' | 'F';
  temperaments: Temperament[];
  type: CatType;
  bio: string;
  photo: ImageSourcePropType;
  photos: ImageSourcePropType[];
  radiusM: number;
  stats: { likes: number; views: number };
}
