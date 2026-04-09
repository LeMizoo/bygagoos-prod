const http = require('http');

function test(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`GET ${url} -> ${res.statusCode}`);
        console.log(body);
        resolve();
      });
    }).on('error', err => {
      console.error(`ERROR ${url} -> ${err.message}`);
      resolve();
    });
  });
}

(async () => {
  console.log('Direct backend tests');
  await test('http://localhost:5000/api/health');
  await test('http://localhost:5000/api/clients');
})();