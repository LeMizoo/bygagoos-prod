import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../src/config/env';
import User from '../src/modules/users/user.model';
import { UserRole } from '../src/core/types/userRoles';

async function createTestUser() {
  try {
    // Connexion MongoDB
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ MongoDB connecté');

    // Vérifier si utilisateur existe
    const existingUser = await User.findOne({ email: 'tovoniaina.rahendrison@gmail.com' });
    if (existingUser) {
      console.log('⚠️  L\'utilisateur tovoniaina.rahendrison@gmail.com existe déjà');
      return;
    }

    // Hash le mot de passe SuperAdmin2026!
    const hashedPassword = await bcrypt.hash('SuperAdmin2026!', 10);

    // Créer l'utilisateur
    const user = new User({
      email: 'tovoniaina.rahendrison@gmail.com',
      password: hashedPassword,
      firstName: 'Tovoniaina',
      lastName: 'Rahendrison',
      role: UserRole.SUPER_ADMIN,
      isActive: true
    });

    await user.save();
    console.log('✅ Utilisateur créé avec succès:');
    console.log('   Email: tovoniaina.rahendrison@gmail.com');
    console.log('   Password: SuperAdmin2026!');
    console.log('   Role: SUPER_ADMIN');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
  }
}

createTestUser();
