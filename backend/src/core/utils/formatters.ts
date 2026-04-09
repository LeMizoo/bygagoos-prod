// backend/src/core/utils/formatters.ts

/**
 * Formate un prix en devise
 * @param price - Le prix à formater
 * @param currency - La devise (EUR par défaut)
 * @returns Le prix formaté
 */
export const formatPrice = (price: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(price);
};

/**
 * Formate une date
 * @param date - La date à formater
 * @returns La date formatée
 */
export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

/**
 * Formate un numéro de téléphone français
 * @param phone - Le numéro à formater
 * @returns Le numéro formaté
 */
export const formatPhoneNumber = (phone: string): string => {
  // Format français: 06 12 34 56 78
  return phone.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
};

/**
 * Formate une date en format court
 * @param date - La date à formater
 * @returns La date formatée (JJ/MM/AAAA)
 */
export const formatShortDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

/**
 * Tronque un texte
 * @param text - Le texte à tronquer
 * @param length - Longueur maximale
 * @param suffix - Suffixe à ajouter
 * @returns Le texte tronqué
 */
export const truncateText = (text: string, length: number = 100, suffix: string = '...'): string => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
};

/**
 * Capitalise la première lettre d'une chaîne
 * @param text - Le texte à capitaliser
 * @returns Le texte avec première lettre en majuscule
 */
export const capitalizeFirst = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formate un nom complet
 * @param firstName - Prénom
 * @param lastName - Nom
 * @returns Le nom formaté
 */
export const formatFullName = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return '';
  if (!firstName) return lastName || '';
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`.trim();
};