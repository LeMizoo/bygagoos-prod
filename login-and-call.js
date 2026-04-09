const http = require('http');

const HOST = 'localhost';
const PORT = 5000;
const CREDENTIALS = {
  email: 'tovoniaina.rahendrison@gmail.com',
  password: 'SuperAdmin2026!'
};

function requestJSON(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        let parsed = data;
        try {
          if (contentType.includes('application/json') || data.trim().startsWith('{') || data.trim().startsWith('[')) {
            parsed = JSON.parse(data);
          }
        } catch (e) {
          // leave raw
        }
        resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }

    req.end();
  });
}

(async () => {
  try {
    console.log('-> POST /api/auth/login');
    const loginRes = await requestJSON({
      hostname: HOST,
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, CREDENTIALS);

    console.log('Status:', loginRes.statusCode);
    console.log('Body:', JSON.stringify(loginRes.body, null, 2));

    // Try to extract accessToken from common locations
    const findToken = (obj) => {
      if (!obj || typeof obj !== 'object') return null;
      if (obj.accessToken) return obj.accessToken;
      if (obj.token) return obj.token;
      if (obj.data) return findToken(obj.data);
      if (obj.body) return findToken(obj.body);
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (typeof v === 'object') {
          const t = findToken(v);
          if (t) return t;
        }
      }
      return null;
    };

    const token = findToken(loginRes.body);
    if (!token) {
      console.error('No access token found in login response.');
      process.exit(1);
    }

    console.log('Got token, calling GET /api/clients');
    const clientsRes = await requestJSON({
      hostname: HOST,
      port: PORT,
      path: '/api/clients',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Clients Status:', clientsRes.statusCode);
    console.log('Clients Body:', JSON.stringify(clientsRes.body, null, 2));

  } catch (err) {
    console.error('Error during requests:', err);
    process.exit(1);
  }
})();
