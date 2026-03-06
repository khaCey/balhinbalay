const fs = require('fs');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const redirectServedPath = require('react-dev-utils/redirectServedPathMiddleware');
const paths = require('react-scripts/config/paths');

module.exports = {
  devServer: (devServerConfig) => {
    delete devServerConfig.onBeforeSetupMiddleware;
    delete devServerConfig.onAfterSetupMiddleware;
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      middlewares.unshift({
        name: 'eval-source-map',
        middleware: evalSourceMapMiddleware(devServer),
      });
      if (fs.existsSync(paths.proxySetup)) {
        require(paths.proxySetup)(devServer.app);
      }
      middlewares.push({
        name: 'redirect-served-path',
        middleware: redirectServedPath(paths.publicUrlOrPath),
      });
      middlewares.push({
        name: 'noop-service-worker',
        middleware: noopServiceWorkerMiddleware(paths.publicUrlOrPath),
      });
      return middlewares;
    };
    return devServerConfig;
  },
};
