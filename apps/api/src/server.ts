const fastify = require('fastify')({
    logger: true // Enables built-in logging
  });
  
  // Declare a route
  fastify.get('/', async (request, reply) => {
    return { hello: 'world' };
  });
  
  // Run the server
  const start = async () => {
    try {
      // Listen on port 3000 and host 0.0.0.0 for broader compatibility (e.g., Docker)
      await fastify.listen({ port: 3000, host: '0.0.0.0' });
      fastify.log.info(`Server listening on ${fastify.server.address().port}`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };
  
  start();