const apicache = require('apicache');
const path = require('path');
const linkService = require('./services/linkService');

const cache = apicache.middleware;

module.exports = (app) => {
  // this is what link is calling to post some data from dApp and save it to database (filling request field). Later zelcore is calling the same and filing response field
  // {operationid, reqest, response}
  app.post('/api/adapter', (req, res) => {
    linkService.processAdapter(req, res);
  });
  // this is what zelcore is calling to get data of operationid
  // {operationid, reqest, response}
  app.get('/api/adapter/:?operationid', (req, res) => {
    linkService.operationStatus(req, res);
  });

  // this is what link is constantly polling to know if zelcore closed the connection
  app.get('/api/adapterstatus/:?adapterid', (req, res) => {
    linkService.adapterStatus(req, res);
  });
  // this is what zelcore is calling if it wants to exit connection
  app.get('/api/adapterdisconnect/:?adapterid', (req, res) => {
    linkService.zelcoreAsksDisconnect(req, res);
  });

  app.get('/', cache('5 minutes'), (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
  app.get('*', cache('5 minutes'), (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
};
