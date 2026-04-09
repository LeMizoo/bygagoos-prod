// backend/src/scripts/list-users-permissions.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { STAFF_MANAGEMENT_ROLES } from '../config/roles.config';

dotenv.config();

async function listUsersAndPermissions() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connecté à MongoDB');

    // Récupérer les modèles
    const User = mongoose.model('User');
    const Staff = mongoose.model('Staff');

    const users = await User.find({}).sort({ role: 1, name: 1 });
    
    console.log('\n📋 LISTE DES UTILISATEURS ET PERMISSIONS\n');
    console.log('Rôles autorisés pour staff:', STAFF_MANAGEMENT_ROLES);
    console.log('=' .repeat(80));
    
    // Grouper par rôle
    const groupedByRole: Record<string, any[]> = {};
    
    for (const user of users) {
      const role = user.role || 'unknown';
      if (!groupedByRole[role]) {
        groupedByRole[role] = [];
      }
      groupedByRole[role].push(user);
    }
    
    // Afficher par rôle
    for (const [role, roleUsers] of Object.entries(groupedByRole)) {
      console.log(`\n📌 RÔLE: ${role.toUpperCase()} (${roleUsers.length} utilisateurs)`);
      console.log('-'.repeat(40));
      
      for (const user of roleUsers) {
        const canManage = STAFF_MANAGEMENT_ROLES.includes(user.role as any);
        const staff = await Staff.findOne({ email: user.email });
        
        console.log(`   ${canManage ? '✅' : '👤'} ${user.name || 'Sans nom'}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Rôle: ${user.role}`);
        if (staff) {
          console.log(`      Staff: ${staff.role} (${staff.department})`);
        } else {
          console.log(`      Staff: ❌ Non créé`);
        }
      }
    }
    
    console.log('\n' + '=' .repeat(80));
    console.log(`📊 TOTAL: ${users.length} utilisateurs`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

listUsersAndPermissions();