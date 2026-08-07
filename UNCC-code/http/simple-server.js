// server

const http = require('node:http');

const server = http.createServer();

server.on('request', (request, response) => {
  console.log("method", request.method);
  console.log('url', request.url);
  console.log('headers', request.headers);

  let data = '';
  const name = request.headers.name;

  request.on('data', (chunk) => {
    data += chunk.toString();
  });

  request.on('end', () => {
    data = JSON.parse(data);
    console.log('requestBody', data, name);
  });


  response.writeHead(200, {
    "Content-Type": 'application/json'
  });

  response.end(JSON.stringify({ message: 'the end of server response' }));
});

server.listen(8050, () => {
  console.log("Server listening on http://localhost:8050");
});