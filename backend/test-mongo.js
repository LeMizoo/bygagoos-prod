require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('[TEST] Connexion MongoDB...');
  console.log('URI:', process.env.MONGODB_URI.replace(/bygagoos:.*@/, 'bygagoos:****@'));
  
  const client = new MongoClient(process.env.MONGODB_URI, {
    family: 4,
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000
  });

  try {
    await client.connect();
    console.log('[SUCCES] Connexion etablie !');
    
    const dbs = await client.db().admin().listDatabases();
    console.log('[BDD] Bases disponibles:', dbs.databases.map(db => db.name));
    
    await client.close();
  } catch (error) {
    console.error('[ERREUR]', error.message);
    console.error('Code:', error.code);
    console.error('Type:', error.name);
    
    if (error.message.includes('querySrv')) {
      console.log('\n[SOLUTION] Probleme DNS detecte. Essaie ces solutions :');
      console.log('1. Ajoute &family=4 a l\'URI (deja fait)');
      console.log('2. Utilise le format standard au lieu de SRV :');
      console.log('   mongodb://bygagoos:bygagoos123@cluster0-shard-00-00.w8joq0e.mongodb.net:27017,cluster0-shard-00-01.w8joq0e.mongodb.net:27017,cluster0-shard-00-02.w8joq0e.mongodb.net:27017/bygagoos-ink?ssl=true&replicaSet=atlas-14p8zd-shard-0&authSource=admin&retryWrites=true&w=majority');
      console.log('3. Verifie que ton IP est autorisee dans MongoDB Atlas (Network Access)');
    }
  }
}

testConnection();
