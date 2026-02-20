const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bygagoos:bygagoos123@cluster0.w8joq0e.mongodb.net/bygagoos-ink?retryWrites=true&w=majority';

async function fixAuth() {
  console.log('\n🔧 DIAGNOSTIC ET RÉPARATION DE L\'AUTHENTIFICATION');
  console.log('='.repeat(60));
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('📡 Connexion à MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connecté à MongoDB\n');
    
    const db = client.db('bygagoos-ink');
    const collection = db.collection('users');
    
    // 1. Vérifier tous les utilisateurs
    const users = await collection.find({}).toArray();
    
    console.log('📋 UTILISATEURS DANS LA BASE:');
    console.log('-'.repeat(50));
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`);
      console.log(`   Nom: ${user.name || 'N/A'}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Actif: ${user.isActive ? '✅' : '❌'}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Hash présent: ${user.password ? '✅' : '❌'}`);
    });
    
    console.log('\n' + '='.repeat(60));
    
    // 2. Demander quel utilisateur réparer
    rl.question('\n📧 Entrez l\'email à réparer (ou "demo" pour créer un utilisateur de test): ', async (emailInput) => {
      
      if (emailInput.toLowerCase() === 'demo') {
        await createDemoUser(collection);
        rl.close();
        await client.close();
        return;
      }
      
      const user = await collection.findOne({ email: emailInput });
      
      if (!user) {
        console.log(`\n❌ Utilisateur ${emailInput} non trouvé`);
        console.log('📝 Création d\'un nouvel utilisateur...');
        
        rl.question('Nom complet: ', async (name) => {
          rl.question('Rôle (SUPER_ADMIN, ADMIN, USER): ', async (role) => {
            rl.question('Nouveau mot de passe: ', async (password) => {
              await createUser(collection, emailInput, password, name, role);
              rl.close();
              await client.close();
            });
          });
        });
      } else {
        console.log(`\n👤 Utilisateur trouvé: ${user.name} (${user.role})`);
        
        rl.question('🔑 Nouveau mot de passe (laisser vide pour conserver): ', async (password) => {
          if (password) {
            // Réinitialiser le mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);
            
            await collection.updateOne(
              { _id: user._id },
              { 
                $set: { 
                  password: hashedPassword,
                  updatedAt: new Date(),
                  isActive: true
                } 
              }
            );
            
            console.log('\n✅ Mot de passe réinitialisé!');
            console.log(`   Email: ${user.email}`);
            console.log(`   Nouveau mot de passe: ${password}`);
            
            // Tester le login
            console.log('\n🔍 Test de connexion...');
            const testLogin = await bcrypt.compare(password, hashedPassword);
            console.log(`   Test bcrypt: ${testLogin ? '✅ OK' : '❌ ÉCHEC'}`);
          }
          
          // Afficher les informations
          const updatedUser = await collection.findOne({ _id: user._id });
          console.log('\n📋 UTILISATEUR À JOUR:');
          console.log(`   Email: ${updatedUser.email}`);
          console.log(`   Nom: ${updatedUser.name}`);
          console.log(`   Rôle: ${updatedUser.role}`);
          console.log(`   Actif: ${updatedUser.isActive ? '✅' : '❌'}`);
          console.log(`   Hash valide: ${updatedUser.password ? '✅' : '❌'}`);
          
          rl.close();
          await client.close();
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    rl.close();
  }
}

async function createUser(collection, email, password, name, role) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = {
    email,
    password: hashedPassword,
    name: name || email.split('@')[0],
    role: role || 'USER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await collection.insertOne(newUser);
  
  console.log('\n✅ Utilisateur créé!');
  console.log(`   Email: ${email}`);
  console.log(`   Mot de passe: ${password}`);
  console.log(`   Rôle: ${newUser.role}`);
}

async function createDemoUser(collection) {
  // Supprimer l'ancien demo s'il existe
  await collection.deleteOne({ email: 'demo@bygagoos.com' });
  
  const hashedPassword = await bcrypt.hash('Demo123456', 10);
  
  const demoUser = {
    email: 'demo@bygagoos.com',
    password: hashedPassword,
    name: 'Utilisateur Demo',
    role: 'USER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await collection.insertOne(demoUser);
  
  console.log('\n✅ Utilisateur DEMO créé!');
  console.log('='.repeat(40));
  console.log('   Email: demo@bygagoos.com');
  console.log('   Mot de passe: Demo123456');
  console.log('   Rôle: USER');
  console.log('='.repeat(40));
  
  // Vérification
  const verify = await collection.findOne({ email: 'demo@bygagoos.com' });
  const testCompare = await bcrypt.compare('Demo123456', verify.password);
  console.log(`\n🔍 Test de connexion: ${testCompare ? '✅ OK' : '❌ ÉCHEC'}`);
}

fixAuth();