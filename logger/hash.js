'use strict';

const crypto = require('node:crypto');
const { hashOptions } = require('./config');
const { saltLength, keyLength, encoding } = hashOptions

const hash = (password) => new Promise((resolve, reject) => {
  const salt = crypto.randomBytes(saltLength).toString(encoding);
  crypto.scrypt(password, salt, keyLength, (err, result) => {
    if (err) reject(err);
    resolve(salt + ':' + result.toString(encoding));
  });
});

module.exports = hash;
