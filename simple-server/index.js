const http = require('node:http');
const fs = require('node:fs/promises');

const server = http.createServer();

server.on('request', async (request, response) => {

  const getHTMLFile = request.method === 'GET' && request.url === '/';
  const getCSSFile = request.method === 'GET' && request.url === '/index.css';
  const getJSFile = request.method === 'GET' && request.url === '/index.js';

  if (getHTMLFile) {
    response.setHeader('Content-Type', 'text/html');

    const fileHandle = await fs.open('./public/index.html', 'r');
    const fileStream = fileHandle.createReadStream();

    fileStream.pipe(response);
  }

  if (getCSSFile) {
    response.setHeader('Content-Type', 'text/css');

    const fileHandle = await fs.open('./public/index.css', 'r');
    const fileStream = fileHandle.createReadStream();

    fileStream.pipe(response);
  }

  if (getJSFile) {
    response.setHeader('Content-Type', 'text/javascript');

    const fileHandle = await fs.open('./public/index.js', 'r');
    const fileStream = fileHandle.createReadStream();

    fileStream.pipe(response);
  }

});

server.listen(8000, () => {
  console.log("First web server is listening")
})