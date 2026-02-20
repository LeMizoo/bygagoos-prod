// Script rapide pour vérifier la configuration
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration...\n');

// Vérifier les fichiers nécessaires
const requiredFiles = [
  'src/models/Client.ts',
  'src/models/Design.ts', 
  'src/models/Order.ts',
  'src/controllers/clientController.ts',
  'src/controllers/designController.ts',
  'src/controllers/orderController.ts',
  'src/routes/clientRoutes.ts',
  'src/routes/designRoutes.ts',
  'src/routes/orderRoutes.ts',
  'src/validations/client.schema.ts',
  'src/validations/design.schema.ts',
  'src/validations/order.schema.ts'
];

let allGood = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allGood = false;
  }
});

// Vérifier les variables d'environnement
console.log('\n🌍 Variables d\'environnement:');
const env = process.env;
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];

requiredEnv.forEach(varName => {
  if (env[varName]) {
    console.log(`✅ ${varName}=${varName === 'JWT_SECRET' ? '***masqué***' : env[varName]}`);
  } else {
    console.log(`❌ ${varName} - NON DÉFINIE`);
    allGood = false;
  }
});

// Vérifier Cloudinary (optionnel mais recommandé)
console.log('\n☁️  Cloudinary (optionnel):');
const cloudinaryVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
let cloudinaryCount = 0;

cloudinaryVars.forEach(varName => {
  if (env[varName]) {
    cloudinaryCount++;
    console.log(`✅ ${varName}=***masqué***`);
  } else {
    console.log(`⚠️  ${varName} - NON DÉFINIE`);
  }
});

if (cloudinaryCount === 3) {
  console.log('✅ Cloudinary entièrement configuré');
} else if (cloudinaryCount > 0) {
  console.log('⚠️  Cloudinary partiellement configuré - l\'upload de designs sera limité');
} else {
  console.log('⚠️  Cloudinary non configuré - l\'upload de designs ne fonctionnera pas');
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 CONFIGURATION COMPLÈTE !');
  console.log('👉 Lance le serveur avec: npm run dev');
} else {
  console.log('⚠️  CONFIGURATION INCOMPLÈTE');
  console.log('👉 Certains fichiers sont manquants');
}
console.log('='.repeat(50));