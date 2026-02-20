// backend/scripts/migrate-user-roles.js
const mongoose = require('mongoose');
require('dotenv').config();

async function migrateRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const User = mongoose.model('User');
    
    // Voir les rôles actuels
    const currentRoles = await User.distinct('role');
    console.log('📌 Rôles actuellement utilisés:', currentRoles);
    
    // Définir les rôles valides
    const validRoles = ['client', 'user', 'staff', 'admin', 'super_admin'];
    
    // Mettre à jour les utilisateurs avec des rôles invalides
    for (const role of currentRoles) {
      if (!validRoles.includes(role)) {
        console.log(`⚠️ Rôle invalide trouvé: "${role}"`);
        
        const result = await User.updateMany(
          { role: role },
          { $set: { role: 'client' } }
        );
        
        console.log(`   ✅ ${result.modifiedCount} utilisateur(s) mis à jour vers "client"`);
      }
    }
    
    console.log('\n✅ Migration terminée');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateRoles();