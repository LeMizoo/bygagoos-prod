// frontend/src/utils/formatters.ts

/**
 * Formate un prix en devise
 * @param price - Le prix à formater
 * @param currency - La devise (EUR par défaut)
 * @returns Le prix formaté
 */
export const formatPrice = (price: number, currency: string = 'EUR'): string => {
  if (price === undefined || price === null) return '0,00 €';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(price);
};

// Alias pour formatPrice (pour compatibilité)
export const formatCurrency = formatPrice;

/**
 * Formate un montant en Ariary (MGA)
 * @param montant - Le montant à formater
 * @param options - Options de formatage
 * @returns Le montant formaté (ex: 45 678 Ar ou 45 678 MGA)
 */
export const formatAriary = (
  montant: number, 
  options?: { 
    symbole?: 'Ar' | 'MGA'; 
    decimales?: number;
    sansSymbole?: boolean;
  }
): string => {
  if (montant === undefined || montant === null) return '0 Ar';
  
  const symbole = options?.symbole || 'Ar';
  const decimales = options?.decimales || 0;
  
  // Formatage avec séparateur de milliers
  const formateur = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  });
  
  const partieNombre = formateur.format(montant);
  
  if (options?.sansSymbole) {
    return partieNombre;
  }
  
  return `${partieNombre} ${symbole}`;
};

/**
 * Convertit un prix en Ariary (taux de conversion)
 * @param prixEnEuro - Le prix en Euro
 * @param taux - Taux de conversion (1€ = 4800 Ar par défaut)
 * @returns Le prix en Ariary
 */
export const convertEuroToAriary = (prixEnEuro: number, taux: number = 4800): number => {
  return prixEnEuro * taux;
};

/**
 * Formate une date
 * @param date - La date à formater
 * @returns La date formatée
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

/**
 * Formate une date en format court
 * @param date - La date à formater
 * @returns La date formatée (JJ/MM/AAAA)
 */
export const formatShortDate = (date: Date | string): string => {
  if (!date) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

/**
 * Formate un numéro de téléphone (adapté pour Madagascar)
 * @param phone - Le numéro à formater
 * @returns Le numéro formaté
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  // Format Madagascar: 034 12 345 67 ou 032 12 345 67
  return phone.replace(/(\d{3})(\d{2})(\d{3})(\d{2})/, '$1 $2 $3 $4');
};

/**
 * Tronque un texte
 * @param text - Le texte à tronquer
 * @param length - Longueur maximale
 * @param suffix - Suffixe à ajouter
 * @returns Le texte tronqué
 */
export const truncateText = (text: string, length: number = 100, suffix: string = '...'): string => {
  if (!text) return '';
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

/**
 * Convertit une chaîne en slug URL-friendly
 * @param text - Le texte à convertir
 * @returns Le slug
 */
export const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};