import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import User from '../modules/users/user.model';

// Mot de passe unique pour tous les utilisateurs
const UNIFIED_PASSWORD = 'SuperAdmin2026';

interface UserDoc {
  email: string;
  password: string;
  role: string;
  updatedAt: Date;
  save(): Promise<void>;
}

async function unifyPasswords() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI non définie dans .env');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connecté à MongoDB\n');

    // Récupérer tous les utilisateurs
    const users = await User.find({}) as UserDoc[];
    console.log(`👥 ${users.length} utilisateurs trouvés\n`);

    // Hasher le mot de passe unique
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(UNIFIED_PASSWORD, salt);
    
    console.log(`🔑 Mot de passe unifié: "${UNIFIED_PASSWORD}"`);
    console.log(`🔒 Hash généré: ${hashedPassword.substring(0, 30)}...\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Mettre à jour chaque utilisateur
    for (const user of users) {
      try {
        // Vérifier si le mot de passe est déjà le bon
        const isAlreadyCorrect = await bcrypt.compare(UNIFIED_PASSWORD, user.password);
        
        if (isAlreadyCorrect) {
          console.log(`⏭️  ${user.email.padEnd(30)} - déjà OK`);
          skipped++;
        } else {
          // Mettre à jour le mot de passe
          user.password = hashedPassword;
          user.updatedAt = new Date();
          await user.save();
          console.log(`✅ ${user.email.padEnd(30)} - mot de passe mis à jour`);
          updated++;
        }
      } catch (err) {
        console.log(`❌ ${user.email.padEnd(30)} - erreur`);
        errors++;
      }
    }

    console.log('\n📊 RÉSUMÉ:');
    console.log('═'.repeat(50));
    console.log(`   Total: ${users.length} utilisateurs`);
    console.log(`   ✅ Mis à jour: ${updated}`);
    console.log(`   ⏭️  Déjà OK: ${skipped}`);
    console.log(`   ❌ Erreurs: ${errors}`);
    console.log('═'.repeat(50));
    console.log(`\n🔑 Tous les utilisateurs ont maintenant le mot de passe: "${UNIFIED_PASSWORD}"`);
    console.log('\n📧 Emails disponibles:');
    users.forEach((user: UserDoc, index: number) => {
      console.log(`   ${(index + 1).toString().padStart(2)}. ${user.email.padEnd(30)} (${user.role})`);
    });
    console.log('\n🚀 Tu peux maintenant te connecter avec n\'importe quel email et ce mot de passe!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

unifyPasswords();