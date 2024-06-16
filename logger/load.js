'use strict';

const fs = require('node:fs').promises;
const vm = require('node:vm');
const { runOptions } = require('./config');

module.exports = async (filePath, sandbox) => {
  const src = await fs.readFile(filePath, 'utf8');
  const code = `'use strict';\n${src}`;
  const script = new vm.Script(code);
  const context = vm.createContext(Object.freeze({ ...sandbox }));
  return script.runInContext(context, runOptions);
};
