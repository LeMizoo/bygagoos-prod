// backend/scripts/check-user-model.js
const mongoose = require('mongoose');
require('dotenv').config();

async function checkUserModel() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer le modèle User
    const User = mongoose.model('User');
    
    // Récupérer le schéma
    const schema = User.schema;
    
    // Vérifier le champ role
    const rolePath = schema.path('role');
    
    console.log('🔍 Analyse du modèle User:');
    console.log('--------------------------');
    
    if (rolePath) {
      console.log('📌 Champ "role" trouvé');
      
      const enumValues = rolePath.enumValues;
      if (enumValues && enumValues.length > 0) {
        console.log('✅ Valeurs autorisées:');
        enumValues.forEach((value, index) => {
          console.log(`   ${index + 1}. "${value}"`);
        });
      } else {
        console.log('⚠️ Pas de contrainte enum trouvée');
      }
    } else {
      console.log('❌ Champ "role" non trouvé dans le schéma');
    }
    
    // Compter les utilisateurs par rôle
    const users = await User.find({}).select('role');
    const roleCount = {};
    
    users.forEach((user) => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    
    console.log('\n📊 Répartition des rôles existants:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   • ${role}: ${count} utilisateur(s)`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUserModel();