const dns = require('dns');

console.log('Serveurs DNS actuels :', dns.getServers());

dns.resolveSrv('_mongodb._tcp.cluster0.w8joq0e.mongodb.net', (err, result) => {
    if (err) {
        console.error('❌ Échec de la résolution SRV :', err);
        console.log('\n🔁 Tentative avec les DNS Google (8.8.8.8)...');
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        dns.resolveSrv('_mongodb._tcp.cluster0.w8joq0e.mongodb.net', (err2, result2) => {
            if (err2) {
                console.error('❌ Échec même avec DNS Google :', err2);
                console.log('\n💡 Vérifie que ton pare-feu ne bloque pas les requêtes DNS sortantes.');
            } else {
                console.log('✅ Succès avec DNS Google :', result2);
                console.log('\n✅ Tu peux forcer Node.js à utiliser ces DNS dans ton application.');
            }
        });
    } else {
        console.log('✅ Résolution SRV réussie :', result);
    }
});