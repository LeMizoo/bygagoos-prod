const mongoose = require('mongoose');
const MONGODB_PASSWORD = 'bygagoos123';
const uri = `mongodb+srv://bygagoos:${MONGODB_PASSWORD}@cluster0.w8joq0e.mongodb.net/bygagoos-ink?retryWrites=true&w=majority&authSource=admin`;

console.log('í´„ Connexion Ã  MongoDB...');
console.log('í³Œ URI:', uri.replace(/:[^:]*@/, ':****@'));

mongoose.connect(uri).then(async () => {
  console.log('âœ… ConnectÃ© Ã  MongoDB');
  
  const HASHED_PASSWORD = '$2b$10$qYQl1jDb.Bw/tjJ6NRjjwex/rXpkXJyxMRj8iy8ohQPvOuNaR/SYC';
  
  const users = await mongoose.connection.collection('users').find().toArray();
  console.log(`í±¥ ${users.length} utilisateurs trouvÃ©s`);
  
  let updated = 0;
  
  for (const user of users) {
    await mongoose.connection.collection('users').updateOne(
      { _id: user._id },
      { $set: { password: HASHED_PASSWORD, updatedAt: new Date() } }
    );
    console.log(`âœ… ${user.email} - mot de passe mis Ã  jour`);
    updated++;
  }
  
  console.log('\ní³Š RÃ‰SUMÃ‰:');
  console.log(`   âœ… ${updated} utilisateurs mis Ã  jour`);
  console.log('   í´‘ Nouveau mot de passe: "SuperAdmin2026"');
  console.log('\ní³§ Emails disponibles:');
  users.forEach((user, i) => {
    console.log(`   ${i+1}. ${user.email} (${user.role})`);
  });
  
  await mongoose.disconnect();
  console.log('\ní±‹ DÃ©connectÃ©');
}).catch(err => {
  console.error('âŒ Erreur de connexion:', err);
});
