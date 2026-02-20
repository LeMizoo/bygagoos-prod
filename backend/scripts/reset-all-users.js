const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bygagoos:bygagoos123@cluster0.w8joq0e.mongodb.net/bygagoos-ink?retryWrites=true&w=majority';

async function resetAll() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('bygagoos-ink');
    const collection = db.collection('users');
    
    // Supprimer tous les utilisateurs
    await collection.deleteMany({});
    console.log('✅ Tous les utilisateurs supprimés');
    
    // Créer les nouveaux utilisateurs
    const users = [
      {
        email: 'tovoniaina.rahendrison@gmail.com',
        password: await bcrypt.hash('SuperAdmin2026!', 10),
        name: 'Tovoniaina Rahendrison',
        role: 'SUPER_ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'dedettenadia@gmail.com',
        password: await bcrypt.hash('Inspiration2026!', 10),
        name: 'Volatiana Randrianarisoa',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'miantsatianarahendrison@gmail.com',
        password: await bcrypt.hash('Production2026!', 10),
        name: 'Miantsatiana Rahendrison',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'fanirytia17@gmail.com',
        password: await bcrypt.hash('Communication2026!', 10),
        name: 'Tia Faniry Rahendrison',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'demo@bygagoos.com',
        password: await bcrypt.hash('Demo123456', 10),
        name: 'Utilisateur Demo',
        role: 'USER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const result = await collection.insertMany(users);
    
    console.log('\n✅ Utilisateurs créés:');
    users.forEach((user, i) => {
      console.log(`\n${i+1}. ${user.email}`);
      console.log(`   Mot de passe: ${user.password === users[i].password ? '🔒' : '❌'}`);
      console.log(`   Rôle: ${user.role}`);
    });
    
    console.log('\n🔑 MOTS DE PASSE:');
    console.log('tovoniaina.rahendrison@gmail.com -> SuperAdmin2026!');
    console.log('dedettenadia@gmail.com -> Inspiration2026!');
    console.log('miantsatianarahendrison@gmail.com -> Production2026!');
    console.log('fanirytia17@gmail.com -> Communication2026!');
    console.log('demo@bygagoos.com -> Demo123456');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.close();
  }
}

resetAll();