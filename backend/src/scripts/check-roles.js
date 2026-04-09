// backend/scripts/check-roles.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bygagoos:bygagoos123@cluster0.w8joq0e.mongodb.net/bygagoos-ink?retryWrites=true&w=majority';
const DB_NAME = 'bygagoos-ink';

async function checkRoles() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Vérifier les utilisateurs
    const users = await db.collection('users').find({}).toArray();
    console.log('📋 UTILISATEURS :');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) : ${u.role}`);
    });
    
    // Vérifier les rôles autorisés
    const allowedRoles = ['super-admin', 'admin-inspiration', 'admin-production', 'admin-communication'];
    console.log('\n🔐 RÔLES AUTORISÉS à gérer le staff :', allowedRoles);
    
    // Vérifier qui peut gérer le staff
    const allowedUsers = users.filter(u => allowedRoles.includes(u.role));
    console.log('\n✅ UTILISATEURS AUTORISÉS :');
    allowedUsers.forEach(u => {
      console.log(`- ${u.name} (${u.email}) : ${u.role}`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await client.close();
  }
}

checkRoles();