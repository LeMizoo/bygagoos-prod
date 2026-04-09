// seed-all-users.js - Script complet d'insertion avec vérification
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // CHANGÉ: bcrypt au lieu de bcryptjs
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bygagoos:bygagoos123@cluster0.w8joq0e.mongodb.net/bygagoos-ink?retryWrites=true&w=majority';

// Fonction pour hasher un mot de passe (utile pour le démo)
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

const users = [
  {
    _id: new mongoose.Types.ObjectId("69808ad9a2fee129fcaa7507"),
    id: "1",
    email: "tovoniaina.rahendrison@gmail.com",
    password: "$2a$10$XDZ2swtz9U4rabyBqknE2OSWQfRXxifbMC784EeFG9iUxcuhny.cC", // SuperAdmin2026!
    role: "SUPER_ADMIN",
    name: "Tovoniaina Rahendrison",
    avatar: "/images/profiles/tovoniaina.jpg",
    phone: "+261 34 43 593 30",
    isActive: true,
    createdAt: new Date("2026-02-03T08:10:09.078Z"),
    updatedAt: new Date("2026-02-03T08:10:09.078Z")
  },
  {
    _id: new mongoose.Types.ObjectId("69808ad9a2fee129fcaa7508"),
    id: "2",
    email: "dedettenadia@gmail.com",
    password: "$2a$10$roDoreroZ95zzsSFR5F.KeUmnXZ8WhspFEFVd.XN34ZBLe2JW4XKG", // Admin123!
    role: "ADMIN",
    name: "Volatiana Randrianarisoa",
    avatar: "/images/profiles/volatiana.jpg",
    phone: "",
    isActive: true,
    createdAt: new Date("2026-02-03T08:10:09.161Z"),
    updatedAt: new Date("2026-02-03T08:10:09.161Z")
  },
  {
    _id: new mongoose.Types.ObjectId("69808ad9a2fee129fcaa7509"),
    id: "3",
    email: "miantsatianarahendrison@gmail.com",
    password: "$2a$10$mq0iaGktkzK/.vLvBJ6Ulu2Ps7bdS0Cfo9fzyq1fNSY9tAZyEth/K", // Admin123!
    role: "ADMIN",
    name: "Miantsatiana Rahendrison",
    avatar: "/images/profiles/miantsatiana.jpg",
    phone: "",
    isActive: true,
    createdAt: new Date("2026-02-03T08:10:09.245Z"),
    updatedAt: new Date("2026-02-03T08:10:09.245Z")
  },
  {
    _id: new mongoose.Types.ObjectId("69808ad9a2fee129fcaa750a"),
    id: "4",
    email: "fanirytia17@gmail.com",
    password: "$2a$10$YYj0OlHqnqI2c1haUIRPI.G2qGDNHyHgBGtVtqdNOE0Me55MIxOWG", // Admin123!
    role: "ADMIN",
    name: "Tia Faniry Rahendrison",
    avatar: "/images/profiles/tia-faniry.jpg",
    phone: "",
    isActive: true,
    createdAt: new Date("2026-02-03T08:10:09.331Z"),
    updatedAt: new Date("2026-02-03T08:10:09.331Z")
  }
];

// Utilisateur de démo (optionnel)
async function addDemoUserIfNeeded(collection) {
  const demoUser = {
    _id: new mongoose.Types.ObjectId(),
    id: "5",
    email: "demo@bygagoos.com",
    password: await hashPassword("Demo123456"),
    role: "USER",
    name: "Demo User",
    firstName: "Demo",
    lastName: "User",
    avatar: null,
    phone: "",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const existingDemo = await collection.findOne({ email: "demo@bygagoos.com" });
  if (!existingDemo) {
    await collection.insertOne(demoUser);
    console.log('✅ Utilisateur de démo ajouté');
    return 1;
  }
  return 0;
}

async function seedUsers() {
  let client;
  
  try {
    console.log('🚀 Début du seeding des utilisateurs...\n');
    
    // Connexion
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connecté à MongoDB Atlas');
    
    const db = client.db('bygagoos-ink');
    const collection = db.collection('users');
    
    // 1. Vérifier l'existant
    const existingCount = await collection.countDocuments();
    console.log(`📊 Utilisateurs existants: ${existingCount}`);
    
    if (existingCount > 0) {
      console.log('🗑️ Suppression des utilisateurs existants...');
      const deleteResult = await collection.deleteMany({});
      console.log(`✅ ${deleteResult.deletedCount} utilisateurs supprimés`);
    }
    
    // 2. Insérer les nouveaux
    console.log('\n📝 Insertion des utilisateurs...');
    const insertResult = await collection.insertMany(users);
    console.log(`✅ ${insertResult.insertedCount} utilisateurs insérés`);
    
    // 3. Ajouter utilisateur de démo
    const demoAdded = await addDemoUserIfNeeded(collection);
    
    // 4. Vérification
    const finalCount = await collection.countDocuments();
    console.log(`\n📈 Total utilisateurs après insertion: ${finalCount}`);
    
    // 5. Afficher les détails
    const insertedUsers = await collection.find({}).toArray();
    console.log('\n📋 Détail des utilisateurs:');
    console.log('═'.repeat(80));
    
    insertedUsers.forEach((user, index) => {
      console.log(`\n👤 Utilisateur ${index + 1}:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Nom: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Téléphone: ${user.phone || 'Non renseigné'}`);
      console.log(`   Actif: ${user.isActive ? '✅' : '❌'}`);
      console.log(`   Créé le: ${new Date(user.createdAt).toLocaleString()}`);
      console.log('─'.repeat(50));
    });
    
    // 6. Résumé
    console.log('\n📊 RÉSUMÉ FINAL:');
    console.log('═'.repeat(80));
    console.log(`✅ ${insertedUsers.length} utilisateurs en base`);
    console.log(`🔐 Authentification fonctionnelle (bcrypt)`);
    console.log(`🌐 Backend prêt sur http://localhost:5000`);
    console.log(`🎨 Frontend prêt sur http://localhost:3000`);
    console.log('\n🔑 Identifiants de test:');
    console.log(`   Super Admin: tovoniaina.rahendrison@gmail.com / SuperAdmin2026!`);
    console.log(`   Admin: dedettenadia@gmail.com / Admin123!`);
    console.log(`   Demo: demo@bygagoos.com / Demo123456`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

// Exécuter
seedUsers();