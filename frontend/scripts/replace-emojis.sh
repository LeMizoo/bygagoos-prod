#!/bin/bash
# frontend/scripts/replace-emojis.sh

echo "🔧 Recherche des emojis dans les fichiers..."

# Liste des fichiers .tsx
find ./src -name "*.tsx" | while read file; do
  echo "📄 Vérification: $file"
  
  # Vérifier si le fichier contient des emojis courants
  if grep -q -E "🎨|👨‍👩‍👧‍👦|🌱|📦|⚙️|🎯|🚀|✨|✓|→|🏠|👤|🔒|📧|📞|📍|📸|👍|👀|✏️|🗑️|➕|🔍|📅|💵|📤|📥|👁️|🚪|⬇️" "$file"; then
    echo "  🔍 Emojis trouvés dans: $file"
    
    # Ajouter l'import Lucide si nécessaire
    if ! grep -q "from 'lucide-react'" "$file"; then
      echo "  ➕ Ajout de l'import Lucide-React"
      sed -i "1s/^/import { Palette, Users, Sprout, Package, Settings, Target, Rocket, Sparkles, Check, ArrowRight, Home, User, Lock, Mail, Phone, MapPin, Instagram, ThumbsUp, Eye, Edit, Trash2, Plus, Search, Calendar, DollarSign, Upload, Download, EyeOff, LogOut, ChevronDown } from 'lucide-react';\n/" "$file"
    fi
    
    # Remplacer les emojis
    sed -i '
      s/🎨/<Palette className="h-5 w-5 inline mr-2" \/>/g
      s/👨‍👩‍👧‍👦/<Users className="h-5 w-5 inline mr-2" \/>/g
      s/🌱/<Sprout className="h-5 w-5 inline mr-2" \/>/g
      s/📦/<Package className="h-5 w-5 inline mr-2" \/>/g
      s/⚙️/<Settings className="h-5 w-5 inline mr-2" \/>/g
      s/🎯/<Target className="h-5 w-5 inline mr-2" \/>/g
      s/🚀/<Rocket className="h-5 w-5 inline mr-2" \/>/g
      s/✨/<Sparkles className="h-5 w-5 inline mr-2" \/>/g
      s/✓/<Check className="h-5 w-5 inline mr-2" \/>/g
      s/→/<ArrowRight className="h-5 w-5 inline mr-2" \/>/g
      s/🏠/<Home className="h-5 w-5 inline mr-2" \/>/g
      s/👤/<User className="h-5 w-5 inline mr-2" \/>/g
      s/🔒/<Lock className="h-5 w-5 inline mr-2" \/>/g
      s/📧/<Mail className="h-5 w-5 inline mr-2" \/>/g
      s/📞/<Phone className="h-5 w-5 inline mr-2" \/>/g
      s/📍/<MapPin className="h-5 w-5 inline mr-2" \/>/g
      s/📸/<Instagram className="h-5 w-5 inline mr-2" \/>/g
      s/👍/<ThumbsUp className="h-5 w-5 inline mr-2" \/>/g
      s/👀/<Eye className="h-5 w-5 inline mr-2" \/>/g
      s/✏️/<Edit className="h-5 w-5 inline mr-2" \/>/g
      s/🗑️/<Trash2 className="h-5 w-5 inline mr-2" \/>/g
      s/➕/<Plus className="h-5 w-5 inline mr-2" \/>/g
      s/🔍/<Search className="h-5 w-5 inline mr-2" \/>/g
      s/📅/<Calendar className="h-5 w-5 inline mr-2" \/>/g
      s/💵/<DollarSign className="h-5 w-5 inline mr-2" \/>/g
      s/📤/<Upload className="h-5 w-5 inline mr-2" \/>/g
      s/📥/<Download className="h-5 w-5 inline mr-2" \/>/g
      s/👁️/<Eye className="h-5 w-5 inline mr-2" \/>/g
      s/🚪/<LogOut className="h-5 w-5 inline mr-2" \/>/g
      s/⬇️/<ChevronDown className="h-5 w-5 inline mr-2" \/>/g
    ' "$file"
    
    echo "  ✅ Emojis remplacés"
  fi
done

echo "✨ Remplacement des emojis terminé !"