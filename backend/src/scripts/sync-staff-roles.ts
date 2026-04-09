// backend/src/scripts/sync-staff-roles.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { USER_ROLE_TO_STAFF_ROLE } from '../config/roles.config';

dotenv.config();

async function syncStaffRoles() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connecté à MongoDB');

    // Récupérer les modèles
    const User = mongoose.model('User');
    const Staff = mongoose.model('Staff');

    // Récupérer les utilisateurs admins
    const adminUsers = await User.find({
      role: { $in: ['super-admin', 'admin-inspiration', 'admin-production', 'admin-communication'] }
    });

    console.log(`📊 ${adminUsers.length} utilisateurs admins trouvés`);

    let created = 0;
    let updated = 0;

    for (const user of adminUsers) {
      // Trouver l'entrée staff correspondante
      const staffMember = await Staff.findOne({
        $or: [
          { email: user.email },
          { user: user._id }
        ]
      });

      const expectedStaffRole = USER_ROLE_TO_STAFF_ROLE[user.role as keyof typeof USER_ROLE_TO_STAFF_ROLE];

      if (staffMember) {
        // Mettre à jour le rôle si nécessaire
        if (staffMember.role !== expectedStaffRole) {
          console.log(`🔄 Mise à jour rôle pour ${user.name}: ${staffMember.role} -> ${expectedStaffRole}`);
          staffMember.role = expectedStaffRole;
          await staffMember.save();
          updated++;
        } else {
          console.log(`✅ Rôle déjà correct pour ${user.name}: ${staffMember.role}`);
        }
      } else {
        console.log(`⚠️ Aucun staff trouvé pour ${user.name}`);
        console.log(`   Création d'une entrée staff pour ${user.name}...`);
        
        // Extraire prénom et nom
        const nameParts = user.name ? user.name.split(' ') : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';
        
        const newStaff = new Staff({
          firstName: firstName,
          lastName: lastName,
          name: user.name,
          displayName: user.name,
          email: user.email,
          phone: user.phone || '',
          position: user.role.replace('-', ' ').toUpperCase(),
          department: getDepartmentFromRole(expectedStaffRole),
          role: expectedStaffRole,
          category: getCategoryFromRole(expectedStaffRole),
          isActive: true,
          active: true,
          avatar: user.avatar || '',
          profileImage: user.avatar || '',
          user: user._id,
          joinedAt: user.createdAt || new Date(),
          description: `Membre du staff - ${user.role}`,
          notes: ''
        });
        
        await newStaff.save();
        console.log(`   ✅ Entrée staff créée avec ID: ${newStaff._id}`);
        created++;
      }
    }

    console.log('\n📊 RÉSUMÉ DE LA SYNCHRONISATION');
    console.log(`   ✅ Créés: ${created}`);
    console.log(`   🔄 Mis à jour: ${updated}`);
    console.log(`   📊 Total staff: ${await Staff.countDocuments()}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Fonctions helper
function getDepartmentFromRole(role: string): string {
  const departmentMap: Record<string, string> = {
    'SUPER_ADMIN': 'ADMINISTRATION',
    'ADMIN_INSPIRATION': 'INSPIRATION',
    'ADMIN_PRODUCTION': 'PRODUCTION',
    'ADMIN_COMMUNICATION': 'COMMUNICATION'
  };
  return departmentMap[role] || 'LOGISTIQUE';
}

function getCategoryFromRole(role: string): string {
  const categoryMap: Record<string, string> = {
    'SUPER_ADMIN': 'ADMIN',
    'ADMIN_INSPIRATION': 'INSPIRATION',
    'ADMIN_PRODUCTION': 'PRODUCTION',
    'ADMIN_COMMUNICATION': 'ADMIN'
  };
  return categoryMap[role] || 'PRODUCTION';
}

syncStaffRoles();