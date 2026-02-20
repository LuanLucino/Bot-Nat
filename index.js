require('dotenv').config();

const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(`Hello World! APP_ID: ${process.env.APP_ID}`);
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
