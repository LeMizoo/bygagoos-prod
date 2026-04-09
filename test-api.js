// Quick API test
const http = require('http');

async function testApi(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${path}`, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ GET ${path}: ${res.statusCode}`);
        console.log(data);
      });
    });
    req.on('error', (err) => {
      console.error(`❌ GET ${path}: ${err.message}`);
      resolve();
    });
    req.setTimeout(5000, () => {
      console.error(`⏱️ GET ${path}: Timeout`);
      req.destroy();
      resolve();
    });
  });
}

(async () => {
  console.log('Testing API endpoints...\n');
  await testApi('/api/health');
  console.log('\nTesting backend port 5000 directly');
  await testApi('http://localhost:5000/api/health');
  process.exit(0);
})();
