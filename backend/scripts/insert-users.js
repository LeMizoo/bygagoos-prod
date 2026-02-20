// Script pour insérer tous les utilisateurs dans MongoDB
// Exécuter avec: node scripts/insert-users.js

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bygagoos:bygagoos123@cluster0.w8joq0e.mongodb.net/bygagoos-ink?retryWrites=true&w=majority';
const DB_NAME = 'bygagoos-ink';
const COLLECTION = 'users';

// Liste complète des utilisateurs
const users = [
  {
    "_id": { "$oid": "69808ad9a2fee129fcaa7507" },
    "id": "1",
    "email": "tovoniaina.rahendrison@gmail.com",
    "password": "$2a$10$XDZ2swtz9U4rabyBqknE2OSWQfRXxifbMC784EeFG9iUxcuhny.cC",
    "role": "super-admin",
    "name": "Tovoniaina Rahendrison",
    "avatar": "/images/profiles/tovoniaina.jpg",
    "phone": "+261 34 43 593 30",
    "isActive": true,
    "createdAt": new Date("2026-02-03T08:10:09.078Z"),
    "updatedAt": new Date("2026-02-03T08:10:09.078Z")
  },
  {
    "_id": { "$oid": "69808ad9a2fee129fcaa7508" },
    "id": "2",
    "email": "dedettenadia@gmail.com",
    "password": "$2a$10$roDoreroZ95zzsSFR5F.KeUmnXZ8WhspFEFVd.XN34ZBLe2JW4XKG",
    "role": "admin-inspiration",
    "name": "Volatiana Randrianarisoa",
    "avatar": "/images/profiles/volatiana.jpg",
    "phone": "",
    "isActive": true,
    "createdAt": new Date("2026-02-03T08:10:09.161Z"),
    "updatedAt": new Date("2026-02-03T08:10:09.161Z")
  },
  {
    "_id": { "$oid": "69808ad9a2fee129fcaa7509" },
    "id": "3",
    "email": "miantsatianarahendrison@gmail.com",
    "password": "$2a$10$mq0iaGktkzK/.vLvBJ6Ulu2Ps7bdS0Cfo9fzyq1fNSY9tAZyEth/K",
    "role": "admin-production",
    "name": "Miantsatiana Rahendrison",
    "avatar": "/images/profiles/miantsatiana.jpg",
    "phone": "",
    "isActive": true,
    "createdAt": new Date("2026-02-03T08:10:09.245Z"),
    "updatedAt": new Date("2026-02-03T08:10:09.245Z")
  },
  {
    "_id": { "$oid": "69808ad9a2fee129fcaa750a" },
    "id": "4",
    "email": "fanirytia17@gmail.com",
    "password": "$2a$10$YYj0OlHqnqI2c1haUIRPI.G2qGDNHyHgBGtVtqdNOE0Me55MIxOWG",
    "role": "admin-communication",
    "name": "Tia Faniry Rahendrison",
    "avatar": "/images/profiles/tia-faniry.jpg",
    "phone": "",
    "isActive": true,
    "createdAt": new Date("2026-02-03T08:10:09.331Z"),
    "updatedAt": new Date("2026-02-03T08:10:09.331Z")
  }
];

// Fonction pour insérer les utilisateurs
async function insertUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Connexion à MongoDB...');
    await client.connect();
    console.log('✅ Connecté à MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);
    
    // Supprimer les utilisateurs existants (optionnel)
    console.log('🗑️ Suppression des utilisateurs existants...');
    const deleteResult = await collection.deleteMany({});
    console.log(`✅ ${deleteResult.deletedCount} utilisateurs supprimés`);
    
    // Insérer les nouveaux utilisateurs
    console.log('📝 Insertion des nouveaux utilisateurs...');
    const insertResult = await collection.insertMany(users);
    console.log(`✅ ${insertResult.insertedCount} utilisateurs insérés avec succès`);
    
    // Vérifier les utilisateurs insérés
    const insertedUsers = await collection.find({}).toArray();
    console.log('\n📋 Liste des utilisateurs insérés :');
    insertedUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) : ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await client.close();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le script
insertUsers();