'use strict';

const http = require('node:http');
const { host, transport, statics } = require('../config');
const argsHandler = require("../args");
const staticUrl = `${transport}://${host}:${statics.port}`;

const receiveArgs = async (req) => {
  try {
    const buffers = [];
    for await (const chunk of req) buffers.push(chunk);
    const data = Buffer.concat(buffers).toString();
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to receive args or parse JSON: ', err.message || 'Unknown error');
  }
};

const notFound = (res, headers) => {
  res.writeHead(404, headers);
  res.end('Not found');
}

module.exports = (routing, port) => {
  http.createServer(async (req, res) => {
    const headers = {
      'Access-Control-Allow-Origin': staticUrl,
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    const { url, socket } = req;
    const [,name, method] = url.split('/');
    const handler = routing[name][method];

    if (req.method === 'OPTIONS') {
      res.writeHead(204, headers);
      res.end();
      return;
    }

    const args = await argsHandler({
      url,
      routing,
      notFoundFunc: () => notFound(reply),
      receiveArgsFunc: () => receiveArgs(req)
    });
    console.log(`${socket.remoteAddress} ${method} ${url}`);
    const result = await handler(...args);
    res.writeHead(200, headers);
    res.end(JSON.stringify(result.rows));
  }).listen(port);

  console.log(`API on port ${port}`);
};
