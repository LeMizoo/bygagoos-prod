const http = require('http');
const ports = [5000, 3000];
(async ()=>{
  for(const port of ports){
    await new Promise(resolve=>{
      const req = http.get({hostname:'localhost', port, path:'/api/health', timeout:3000}, res=>{
        let data=''; res.on('data',c=>data+=c); res.on('end',()=>{
          console.log(`${port} -> ${res.statusCode}`);
          resolve();
        });
      });
      req.on('error', e=>{ console.log(`${port} -> ERROR: ${e.message}`); resolve(); });
      req.on('timeout', ()=>{ console.log(`${port} -> TIMEOUT`); req.destroy(); resolve(); });
    });
  }
})();