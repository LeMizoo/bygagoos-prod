// frontend/src/components/ui/Avatar.tsx

import React, { useState } from 'react';
// 🔥 CORRECTION: Importer l'objet API par défaut
import adminStaffApi from '../../api/adminStaff.api';
import { User, Camera } from 'lucide-react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onUpload?: (file: File) => Promise<void>;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md',
  editable = false,
  onUpload,
  className = '' 
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-xl',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 18,
    xl: 24,
  };

  // 🔥 CORRECTION: Utiliser adminStaffApi.getOptimizedAvatarUrl()
  const optimizedSrc = src ? adminStaffApi.getOptimizedAvatarUrl(src, {
    width: size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 64 : 96,
    height: size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 64 : 96,
    radius: 999, // Pour les avatars ronds
  }) : null;

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    try {
      setIsUploading(true);
      await onUpload(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className={`relative ${sizes[size]} rounded-full overflow-hidden ${className}`}
      onMouseEnter={() => editable && setIsHovering(true)}
      onMouseLeave={() => editable && setIsHovering(false)}
    >
      {optimizedSrc ? (
        <img 
          src={optimizedSrc} 
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
          {initials}
        </div>
      )}

      {/* Overlay pour upload */}
      {editable && isHovering && !isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer">
          <Camera size={iconSizes[size]} className="text-white" />
          {/* 🔥 CORRECTION: Ajouter un label pour l'accessibilité */}
          <label htmlFor={`avatar-upload-${name.replace(/\s+/g, '-')}`} className="sr-only">
            Changer la photo de profil
          </label>
          <input
            id={`avatar-upload-${name.replace(/\s+/g, '-')}`}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Changer la photo de profil"
            title="Choisir une nouvelle photo"
            disabled={isUploading}
          />
        </div>
      )}

      {/* Loading spinner */}
      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default Avatar;