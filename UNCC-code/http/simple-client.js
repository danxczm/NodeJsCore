// client

const http = require('node:http');

const agent = new http.Agent({ keepAlive: true });

const body = JSON.stringify({
  title: 'Title of my post',
  body: 'This is some text and more and more.',
});

const request = http.request({
  agent: agent,
  hostname: 'localhost',
  port: 8050,
  method: 'POST',
  path: '/create-post',
  headers: {
    "Content-Type": 'application/json',
    "Content-Length": Buffer.byteLength(body),
    "name": 'Zhora',
  }
});

// буде виконано лише раз (відповідь від серверу)
request.on('response', (response) => {
  console.log("responseStatus", response.statusCode);
  console.log("responseHeader", response.headers);

  response.on('data', (chunk) => {
    console.log('serverResponseData',chunk.toString("utf8"));
  });

  response.on('end', () => {
     console.log("The response from server is over")
  })
});

request.end(body);