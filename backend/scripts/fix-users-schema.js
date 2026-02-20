const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bygagoos:bygagoos123@cluster0.w8joq0e.mongodb.net/bygagoos-ink?retryWrites=true&w=majority';

async function fixUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔧 CORRECTION DES UTILISATEURS');
    console.log('='.repeat(50));
    
    await client.connect();
    const db = client.db('bygagoos-ink');
    const collection = db.collection('users');
    
    // Récupérer tous les utilisateurs
    const users = await collection.find({}).toArray();
    console.log(`📊 ${users.length} utilisateurs trouvés\n`);
    
    for (const user of users) {
      console.log(`👤 Traitement: ${user.email}`);
      
      const updates = {};
      
      // Ajouter firstName/lastName manquants
      if (!user.firstName && !user.lastName) {
        if (user.name) {
          const nameParts = user.name.split(' ');
          updates.firstName = nameParts[0] || user.name;
          updates.lastName = nameParts.slice(1).join(' ') || ' ';
        } else {
          updates.firstName = user.email.split('@')[0];
          updates.lastName = ' ';
        }
        console.log(`  ✅ Ajout firstName/lastName: ${updates.firstName} ${updates.lastName}`);
      }
      
      // Corriger le rôle
      if (user.role) {
        const validRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DESIGNER', 'STAFF', 'CLIENT'];
        const upperRole = user.role.toUpperCase();
        
        if (upperRole === 'USER') {
          updates.role = 'CLIENT';
          console.log(`  ✅ Rôle corrigé: ${user.role} -> CLIENT`);
        } else if (!validRoles.includes(upperRole)) {
          if (upperRole.includes('ADMIN')) {
            updates.role = 'ADMIN';
            console.log(`  ✅ Rôle corrigé: ${user.role} -> ADMIN`);
          } else {
            updates.role = 'CLIENT';
            console.log(`  ✅ Rôle corrigé: ${user.role} -> CLIENT`);
          }
        }
      }
      
      // Appliquer les mises à jour
      if (Object.keys(updates).length > 0) {
        await collection.updateOne(
          { _id: user._id },
          { $set: updates }
        );
        console.log(`  ✅ Mise à jour effectuée`);
      } else {
        console.log(`  ✅ Aucune correction nécessaire`);
      }
      
      console.log('-'.repeat(40));
    }
    
    console.log('\n✅ CORRECTIONS TERMINÉES');
    
    // Afficher le résultat
    const fixedUsers = await collection.find({}).toArray();
    console.log('\n📋 UTILISATEURS APRÈS CORRECTION:');
    fixedUsers.forEach(user => {
      console.log(`\n${user.email}`);
      console.log(`  Rôle: ${user.role}`);
      console.log(`  Nom: ${user.firstName || ''} ${user.lastName || ''}`.trim());
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

fixUsers();