import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import User from '../modules/users/user.model';
import Staff from '../modules/staff/staff.model';

const PASSWORD = 'SuperAdmin2026';

async function createStaff() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('📦 Connecté à MongoDB');

    // Nettoyer la collection staff (optionnel)
    await Staff.deleteMany({});
    console.log('🧹 Collection staff nettoyée');

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // Créer des membres du staff
    const staffMembers = await Staff.create([
      {
        firstName: 'Jean',
        lastName: 'Dupont',
        displayName: 'Jean Dupont',
        email: 'jean.dupont@bygagoos.com',
        category: 'PRODUCTION',
        role: 'ADMIN',
        responsibilities: ['Direction', 'Management'],
        active: true,
        isActive: true,
        department: 'Direction',
        position: 'Directeur Général',
        skills: ['Management', 'Stratégie'],
        joinedAt: new Date('2024-01-15')
      },
      {
        firstName: 'Marie',
        lastName: 'Martin',
        displayName: 'Marie Martin',
        email: 'marie.martin@bygagoos.com',
        category: 'PRODUCTION',
        role: 'DESIGNER',
        responsibilities: ['Création', 'Design'],
        active: true,
        isActive: true,
        department: 'Création',
        position: 'Designer Senior',
        skills: ['Photoshop', 'Illustrator', 'Figma'],
        joinedAt: new Date('2024-02-01')
      },
      {
        firstName: 'Pierre',
        lastName: 'Durand',
        displayName: 'Pierre Durand',
        email: 'pierre.durand@bygagoos.com',
        category: 'PRODUCTION',
        role: 'MANAGER',
        responsibilities: ['Production', 'Coordination'],
        active: true,
        isActive: true,
        department: 'Production',
        position: 'Chef de Production',
        skills: ['Gestion de projet', 'Planning'],
        joinedAt: new Date('2024-03-10')
      },
      {
        firstName: 'Sophie',
        lastName: 'Leroy',
        displayName: 'Sophie Leroy',
        email: 'sophie.leroy@bygagoos.com',
        category: 'FAMILY',
        role: 'STAFF',
        responsibilities: ['Communication', 'Réseaux sociaux'],
        active: true,
        isActive: true,
        department: 'Communication',
        position: 'Community Manager',
        skills: ['Social Media', 'Rédaction'],
        joinedAt: new Date('2024-04-05')
      }
    ]);

    console.log(`✅ ${staffMembers.length} membres du staff créés`);

    // Créer des utilisateurs correspondants (optionnel)
    const users = [];
    for (const staff of staffMembers) {
      const existingUser = await User.findOne({ email: staff.email });
      if (!existingUser) {
        const user = await User.create({
          email: staff.email,
          password: hashedPassword,
          role: staff.role,
          staff: staff._id,
          isActive: true,
          firstName: staff.firstName,
          lastName: staff.lastName
        });
        users.push(user);
      }
    }

    console.log(`✅ ${users.length} utilisateurs créés`);

    // Afficher les résultats
    console.log('\n📋 MEMBRES DU STAFF:');
    staffMembers.forEach((s, i) => {
      console.log(`   ${i+1}. ${s.firstName} ${s.lastName} (${s.email}) - ${s.role}`);
    });

    console.log('\n🔑 Tous les comptes ont le mot de passe:', PASSWORD);
    console.log('📧 Emails disponibles pour connexion:');
    staffMembers.forEach(s => console.log(`   - ${s.email}`));

    await mongoose.disconnect();
    console.log('\n👋 Déconnecté');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createStaff();