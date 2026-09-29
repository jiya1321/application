try {
  const serverModule = require('./_server.cjs');
  
  if (typeof serverModule.initializeApp !== 'function' || typeof serverModule.app !== 'function') {
    throw new Error('Server module does not export required functions');
  }
  
  const { initializeApp, app } = serverModule;
  
  let initializationPromise = null;
  
  module.exports = async function handler(req, res) {
    try {
      if (!initializationPromise) {
        console.log('Initializing server...');
        initializationPromise = initializeApp().catch(err => {
          console.error('Server initialization failed:', err);
          throw err;
        });
      }
  
      await initializationPromise;
  
      return app(req, res);
    } catch (error) {
      console.error('Handler error:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Handler execution failed',
          message: error.message,
          stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
        });
      }
    }
  };
} catch (error) {
  console.error('Error loading server module:', error);
  module.exports = async function handler(req, res) {
    console.error('Fallback handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Server initialization failed',
        message: error.message 
      });
    }
  };
}