// frontend/src/config/images.config.ts
// Configuration centralisée des images - À modifier par l'admin

export const imagesConfig = {
  // ByGagoos Ink
  ink: {
    heroBg: "/placeholders/ink/hero-bg.jpg",
    services: {
      serigraphy: "/placeholders/ink/service1.jpg",
      design: "/placeholders/ink/service2.jpg",
      packaging: "/placeholders/ink/service3.jpg",
    },
    gallery: [
      "/placeholders/ink/gallery1.jpg",
      "/placeholders/ink/gallery2.jpg",
      "/placeholders/ink/gallery3.jpg",
      "/placeholders/ink/gallery4.jpg",
      "/placeholders/ink/gallery5.jpg",
      "/placeholders/ink/gallery6.jpg",
    ]
  },
  
  // ByGagoos Trans
  trans: {
    heroBg: "/placeholders/trans/hero-bg.jpg",
    gallery: [
      "/placeholders/trans/gallery1.jpg",
      "/placeholders/trans/gallery2.jpg",
      "/placeholders/trans/gallery3.jpg",
      "/placeholders/trans/gallery4.jpg",
      "/placeholders/trans/gallery5.jpg",
      "/placeholders/trans/gallery6.jpg",
    ],
    excursionBg: "/placeholders/trans/excursion-bg.jpg"
  },
  
  // ByGagoos CDA
  cda: {
    heroBg: "/placeholders/cda/hero-bg.jpg",
    plats: [
      "/placeholders/cda/plat1.jpg",
      "/placeholders/cda/plat2.jpg",
      "/placeholders/cda/plat3.jpg",
      "/placeholders/cda/plat4.jpg",
      "/placeholders/cda/plat5.jpg",
    ],
    chefBg: "/placeholders/cda/chef-bg.jpg"
  },
  
  // Home Page
  home: {
    cards: {
      ink: "/placeholders/home/ink-card.jpg",
      trans: "/placeholders/home/trans-card.jpg",
      cda: "/placeholders/home/cda-card.jpg",
    },
    gallery: [
      "/placeholders/home/gallery1.jpg",
      "/placeholders/home/gallery2.jpg",
      "/placeholders/home/gallery3.jpg",
    ]
  }
};

// Fonction pour que l'admin puisse mettre à jour les images
export const updateImageConfig = (section: string, key: string, newPath: string) => {
  // Cette fonction sera utilisée par l'admin pour modifier les chemins d'images
  console.log(`[Admin] Mise à jour image: ${section}.${key} -> ${newPath}`);
  // En production, cela sauvegarderait dans localStorage ou une API
  localStorage.setItem(`img_${section}_${key}`, newPath);
};

// Fonction pour récupérer les chemins personnalisés (si existants)
export const getImagePath = (section: string, key: string, defaultPath: string): string => {
  const customPath = localStorage.getItem(`img_${section}_${key}`);
  return customPath || defaultPath;
};