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
    const existingUser = await User.findOne({ email: 'demo@bygagoos.com' });
    if (existingUser) {
      console.log('⚠️  L\'utilisateur demo@bygagoos.com existe déjà');
      return;
    }

    // Hash le mot de passe
    const hashedPassword = await bcrypt.hash('Demo123456', 10);

    // Créer l'utilisateur
    const user = new User({
      email: 'demo@bygagoos.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: UserRole.CLIENT,
      isActive: true
    });

    await user.save();
    console.log('✅ Utilisateur créé avec succès:');
    console.log('   Email: demo@bygagoos.com');
    console.log('   Password: Demo123456');
    console.log('   Role: CLIENT');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
  }
}

createTestUser();
