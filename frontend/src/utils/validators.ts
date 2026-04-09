// frontend/src/utils/validators.ts

/**
 * Valide si une chaîne est un ID MongoDB valide (24 caractères hexadécimaux)
 */
export const isValidObjectId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Valide si une chaîne est un ID numérique valide (si vous utilisez des IDs numériques)
 */
export const isValidNumericId = (id: string | number): boolean => {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return !isNaN(numId) && numId > 0;
};

/**
 * Valide si une chaîne est un UUID valide
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};