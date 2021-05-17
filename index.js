const http = require('http');
const config = require('config');
const app = require('./src/lib/server');
const log = require('./src/lib/log');

const serviceHelper = require('./src/services/serviceHelper');
const linkService = require('./src/services/linkService');

const server = http.createServer(app);

serviceHelper.initiateDB();

setTimeout(() => {
  log.info('Preparing indexes');
  linkService.doIndexes(); // no waiting
}, 2000);

server.listen(config.server.port, () => {
  log.info(`Link API listening on port ${config.server.port}!`);
});
