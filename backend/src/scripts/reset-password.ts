import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement depuis le fichier .env à la racine
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Importer les modèles avec le bon chemin relatif (depuis src/scripts/)
import User from '../modules/users/user.model';

async function resetPassword() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI non définie dans .env');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connecté à MongoDB');

    const email = 'tovoniaina.rahendrison@gmail.com';
    const newPassword = 'SuperAdmin2026';

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour l'utilisateur
    const user = await User.findOneAndUpdate(
      { email },
      { 
        password: hashedPassword,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (user) {
      console.log('✅ Mot de passe réinitialisé avec succès pour:', email);
      
      // Vérifier que le mot de passe fonctionne
      const isValid = await bcrypt.compare(newPassword, user.password);
      console.log('🔑 Vérification du mot de passe:', isValid ? '✅ OK' : '❌ ÉCHEC');
      
      console.log('\n📧 Tu peux maintenant te connecter avec:');
      console.log(`   Email: ${email}`);
      console.log(`   Mot de passe: ${newPassword}`);
    } else {
      console.log('❌ Utilisateur non trouvé avec cet email:', email);
      
      // Lister tous les utilisateurs pour déboguer
      const allUsers = await User.find({}).select('email role');
      console.log('\n📋 Utilisateurs disponibles:');
      allUsers.forEach((u: { email: string; role: string }) => {
        console.log(`   - ${u.email} (${u.role})`);
      });
    }

    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

resetPassword();