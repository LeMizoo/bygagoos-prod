import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import User from '../modules/users/user.model';

async function testPassword() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI non définie dans .env');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connecté à MongoDB\n');

    const email = 'tovoniaina.rahendrison@gmail.com';
    const testPassword = 'SuperAdmin2026';

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      
      // Lister tous les utilisateurs
      const allUsers = await User.find({}).select('email role');
      console.log('\n📋 Utilisateurs disponibles:');
      allUsers.forEach((u: { email: string; role: string }) => {
        console.log(`   - ${u.email} (${u.role})`);
      });
      
      process.exit(1);
    }

    console.log('✅ Utilisateur trouvé:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Rôle: ${user.role}`);
    console.log(`   Hash stocké: ${user.password.substring(0, 30)}...\n`);

    // Tester différentes variations du mot de passe
    const variations = [
      testPassword,
      testPassword.trim(),
      testPassword.toLowerCase(),
      testPassword.toUpperCase(),
      'admin123',
      'password123',
      'SuperAdmin2025',
      'SuperAdmin2026!'
    ];

    console.log('🔍 TEST DES VARIATIONS:');
    console.log('═'.repeat(50));
    
    for (const pwd of variations) {
      const isValid = await bcrypt.compare(pwd, user.password);
      console.log(`   "${pwd.padEnd(20)}" : ${isValid ? '✅ OK' : '❌ NON'}`);
    }
    
    console.log('═'.repeat(50));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testPassword();