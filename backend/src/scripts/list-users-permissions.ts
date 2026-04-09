// backend/src/scripts/list-users-permissions.ts

import mongoose from 'mongoose';
import { IUser } from '../modules/users/user.model';  // Import interface
import { IStaff } from '../modules/staff/staff.model';  // Import interface
import { STAFF_MANAGEMENT_ROLES } from '../config/roles.config';
import dotenv from 'dotenv';

dotenv.config();

// Importer les modèles directement
import '../modules/users/user.model';  // Pour enregistrer le modèle
import '../modules/staff/staff.model';  // Pour enregistrer le modèle

async function listUsersAndPermissions() {
  try {
    // Récupérer les modèles après import
    const User = mongoose.model('User');
    const Staff = mongoose.model('Staff');
    
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connecté à MongoDB');

    const users = await User.find({}).sort({ role: 1, name: 1 });
    
    console.log('\n📋 LISTE DES UTILISATEURS ET PERMISSIONS\n');
    console.log('Rôles autorisés pour staff:', STAFF_MANAGEMENT_ROLES);
    console.log('=' .repeat(80));
    
    // ... reste du code
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}