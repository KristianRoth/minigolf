// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require('http-proxy-middleware');

const devBackendUrl = process.env.DEV_BACKEND_URL || 'localhost:8080';

console.log(devBackendUrl);

module.exports = function (app) {
  app.use('/api', createProxyMiddleware({ target: `http://${devBackendUrl}`, changeOrigin: true }));
  app.use(createProxyMiddleware('/ws/game', { target: `ws://${devBackendUrl}`, ws: true, changeOrigin: true }));
};
