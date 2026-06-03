// frontend/src/components/ui/OptimizedImage.tsx
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

const defaultPlaceholders: Record<string, string> = {
  ink: '/placeholders/ink/default.jpg',
  trans: '/placeholders/trans/default.jpg',
  cda: '/placeholders/cda/default.jpg',
  home: '/placeholders/home/default.jpg'
};

export default function OptimizedImage({ src, alt, className = '', fallbackSrc }: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (fallbackSrc) {
        setImgSrc(fallbackSrc);
      } else {
        // Déterminer le placeholder par défaut basé sur le chemin
        let defaultPlaceholder = '/images/logo.png';
        if (src.includes('/ink/')) defaultPlaceholder = '/images/gallery/placeholder-tshirt.jpg';
        else if (src.includes('/trans/')) defaultPlaceholder = '/images/logo.png';
        else if (src.includes('/cda/')) defaultPlaceholder = '/images/logo.png';
        setImgSrc(defaultPlaceholder);
      }
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}