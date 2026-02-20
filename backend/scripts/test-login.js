const axios = require('axios');

async function testLogin() {
  console.log('\n🔐 TEST DE CONNEXION DIRECTE');
  console.log('='.repeat(50));
  
  const testUsers = [
    { email: 'demo@bygagoos.com', password: 'Demo123456' },
    { email: 'tovoniaina.rahendrison@gmail.com', password: 'Admin123!' },
    { email: 'dedettenadia@gmail.com', password: 'Admin123!' }
  ];
  
  for (const user of testUsers) {
    try {
      console.log(`\n📧 Test: ${user.email}`);
      
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: user.email,
        password: user.password
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`✅ Succès! Token reçu: ${response.data.data.accessToken.substring(0, 20)}...`);
      console.log(`   Utilisateur: ${response.data.data.user.name} (${response.data.data.user.role})`);
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Échec: ${error.response.data.message} (${error.response.status})`);
      } else {
        console.log(`❌ Erreur: ${error.message}`);
      }
    }
  }
}

testLogin();