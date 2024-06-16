'use strict';

const host = '127.0.0.1';
const config = {
  port: 8001,
  host,
  transport: 'http', // http,ws,fastify
  statics: {
    port: 8000,
    root: './static'
  },
  hashOptions: {
    saltLength: 16,
    keyLength: 64,
    encoding: 'base64'
  },
  dbOptions: {
    host,
    port: 5432,
    database: 'example',
    user: 'marcus',
    password: 'marcus',
  },
  runOptions: {
    timeout: 5000,
    displayErrors: false
  }
};

module.exports = config;
