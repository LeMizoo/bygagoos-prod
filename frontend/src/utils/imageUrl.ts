export const normalizeImageUrl = (url?: string): string => {
  if (!url) return "/images/placeholder-tshirt.jpg";

  // Les pages de production sont servies en HTTPS.
  // On évite donc les images HTTP qui seraient bloquées comme contenu mixte.
  if (url.startsWith("http://")) {
    return `https://${url.slice("http://".length)}`;
  }

  return url;
};
