const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let p = '.' + req.url;
  if (p === './') p = './index.html';
  const ext = path.extname(p);
  const mime = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };
  fs.readFile(p, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
      res.end(data);
    }
  });
});

server.listen(8080, () => console.log('Server running on http://localhost:8080'));