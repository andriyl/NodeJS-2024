const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const argsHandler = require('../args');
const { host, transport, statics } = require('../config');
const staticUrl = `http://${host}:${statics.port}`;

const notFound = (reply) => {
  reply.status(404).send({ error: 'Not Found' });
}

const receiveArgs = async (req) => {
  try {
    return JSON.parse(req.body);
  } catch (err) {
    console.error('Failed to receive args or parse JSON: ', err.message || 'Unknown error');
  }
}

module.exports = async (routing, port) => {
  fastify.register(cors, { origin: staticUrl });
  const handler = async (req, reply) => {
    const { url } = req.raw;
    const [,name, method] = url.split('/');
    const handler = routing[name][method];
    const args = await argsHandler({
      url,
      routing,
      notFoundFunc: () => notFound(reply),
      receiveArgsFunc: () => receiveArgs(req)
    });
    fastify.log.info(`${req.ip} ${method} ${url}`);
    const result = await handler(...args);
    reply.send(result.rows);
  }
  fastify.route({ method: ['POST'], url: '/*', handler });

  try {
    await fastify.listen({ port });
    console.log(`API on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
