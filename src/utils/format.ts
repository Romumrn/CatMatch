import { Cat, Filters, MyCatProfile } from '../types';

/**
 * Masque un numéro : « 06 12 34 56 78 » → « 06 ** ** ** 78 ».
 * Le numéro complet n'est jamais affiché dans l'app — c'est une démo, et
 * dans une vraie appli de rencontre le téléphone ne transite pas comme ça.
 */
export function maskPhone(phone?: string): string {
  if (!phone) return 'Numéro non renseigné';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '**';
  const head = digits.slice(0, 2);
  const tail = digits.slice(-2);
  const hidden = Math.max(1, Math.ceil((digits.length - 4) / 2));
  return `${head} ${Array(hidden).fill('**').join(' ')} ${tail}`;
}

export function formatDistance(m: number): string {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

export function formatLastActive(min: number): string {
  if (min < 5) return 'En ligne';
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'Hier' : `Il y a ${d} j`;
}

export function formatTime(at: number): string {
  return new Date(at).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDay(at: number): string {
  const d = new Date(at);
  const today = new Date();
  const isSameDay = d.toDateString() === today.toDateString();
  if (isSameDay) return "Aujourd'hui";
  const yesterday = new Date(today.getTime() - 86400000);
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

export function ageLabel(age: number): string {
  return `${age} an${age > 1 ? 's' : ''}`;
}

/**
 * Score d'affinité 0–100. Tempéraments compatibles (50), lieux de rencontre
 * en commun (30), proximité (20). Un timide et un dominant se pénalisent.
 */
export function compatibility(profile: MyCatProfile, cat: Cat): number {
  const shared = cat.temperaments.filter((t) => profile.temperaments.includes(t));
  let temperament = (shared.length / Math.max(1, profile.temperaments.length)) * 50;

  const shy = profile.temperaments.includes('Timide');
  const pushy = cat.temperaments.includes('Dominant') || cat.temperaments.includes('Énergique');
  if (shy && pushy) temperament *= 0.5;

  const places = cat.meetingPlaces.filter((p) => profile.meetingPlaces.includes(p));
  const place = (places.length / Math.max(1, profile.meetingPlaces.length)) * 30;

  const proximity = Math.max(0, 20 - (cat.distanceM / 2000) * 20);

  return Math.round(Math.min(100, Math.max(12, temperament + place + proximity)));
}

export function matchesFilters(cat: Cat, f: Filters): boolean {
  if (cat.distanceM > f.radiusM) return false;
  if (cat.age < f.ageRange[0] || cat.age > f.ageRange[1]) return false;
  if (f.sex !== 'Tous' && cat.sex !== f.sex) return false;
  if (f.verifiedOnly && !cat.verified) return false;
  if (f.meetingPlaces.length && !cat.meetingPlaces.some((p) => f.meetingPlaces.includes(p)))
    return false;
  if (f.temperaments.length && !cat.temperaments.some((t) => f.temperaments.includes(t)))
    return false;
  return true;
}

/** Complétion du profil, pour la jauge de l'écran Profil. */
export function profileCompletion(p: MyCatProfile): { pct: number; missing: string[] } {
  const checks: [boolean, string][] = [
    [p.photos.length >= 3, 'Ajoute au moins 3 photos'],
    [p.bio.trim().length >= 40, 'Étoffe la bio'],
    [p.temperaments.length >= 2, 'Choisis 2 tempéraments ou plus'],
    [p.meetingPlaces.length >= 1, 'Indique un lieu de rencontre'],
    [p.health.vaccinated, 'Renseigne les vaccins'],
    [p.verified, 'Fais vérifier le profil'],
  ];
  const done = checks.filter(([ok]) => ok).length;
  return {
    pct: Math.round((done / checks.length) * 100),
    missing: checks.filter(([ok]) => !ok).map(([, label]) => label),
  };
}
