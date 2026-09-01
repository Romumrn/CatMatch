export const colors = {
  primary: '#FF6B6B',
  primaryDark: '#E85555',
  primarySoft: '#FFEDE9',
  secondary: '#4ECDC4',
  superLike: '#4A9DFF',
  superLikeSoft: '#E8F2FF',
  bg: '#FFF9F5',
  card: '#FFFFFF',
  text: '#2D2A26',
  textLight: '#8A837C',
  border: '#F0E8E0',
  like: '#4ECDC4',
  likeSoft: '#E4F8F6',
  pass: '#FF6B6B',
  gold: '#FFC145',
  goldSoft: '#FFF4DE',
  verified: '#4A9DFF',
  overlay: 'rgba(45,42,38,0.85)',
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const radius = {
  s: 8,
  m: 16,
  l: 24,
  pill: 999,
};

// Ombre portée homogène (iOS + Android + web).
export const shadow = {
  card: {
    shadowColor: '#2D2A26',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  soft: {
    shadowColor: '#2D2A26',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};

// L'app est aussi servie sur desktop (version web) : on garde un format mobile.
export const CONTENT_MAX_W = 480;
