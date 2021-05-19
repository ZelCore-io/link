const apicache = require('apicache');
const path = require('path');
const linkService = require('./services/linkService');

const cache = apicache.middleware;

module.exports = (app) => {
  // this is what link is calling to post some data from dApp and save it to database (filling request field). Later zelcore is calling the same and filing response field
  // {operationid, request, response}
  app.post('/api/adapter', (req, res) => {
    linkService.processAdapter(req, res);
  });
  // this is what zelcore is calling to get data of operationid
  // {operationid, reqest, response}
  app.get('/api/adapter/:operationid?', (req, res) => {
    linkService.operationStatus(req, res);
  });

  // this is what link is constantly polling to know if zelcore closed the connection
  app.get('/api/adapterstatus/:adapterid?', (req, res) => {
    linkService.adapterStatus(req, res);
  });
  // this is what zelcore is calling if it wants to exit connection
  app.get('/api/adapterdisconnect/:adapterid?', (req, res) => {
    linkService.zelcoreAsksDisconnect(req, res);
  });

  // sol-wallet-adapter test app
  // https://github.com/project-serum/sol-wallet-adapter
  app.get('/testdapp', cache('5 minutes'), (req, res) => {
    res.sendFile(path.join(__dirname, '../testdapp/index.html'));
  });
  app.get('/static/js/2.6e96e63f.chunk.js', cache('5 minutes'), (req, res) => {
    res.sendFile(path.join(__dirname, '../testdapp/static/js/2.6e96e63f.chunk.js'));
  });
  app.get('/static/css/main.a1524731.chunk.css', cache('5 minutes'), (req, res) => {
    res.sendFile(path.join(__dirname, '../testdapp/static/css/main.a1524731.chunk.css'));
  });
  app.get('/static/js/main.31c8aaca.chunk.js', cache('5 minutes'), (req, res) => {
    res.sendFile(path.join(__dirname, '../testdapp/static/js/main.31c8aaca.chunk.js'));
  });
  app.get('/manifest.json', cache('5 minutes'), (req, res) => {
    res.sendFile(path.join(__dirname, '../testdapp/manifest.json'));
  });
  app.get('/static/js/main.31c8aaca.chunk.js.map', cache('5 minutes'), (req, res) => {
    res.sendFile(path.join(__dirname, '../testdapp/static/js/main.31c8aaca.chunk.js.map'));
  });
  app.get('/static/js/2.6e96e63f.chunk.js.map', cache('5 minutes'), (req, res) => {
    res.sendFile(path.join(__dirname, '../testdapp/static/js/2.6e96e63f.chunk.js.map'));
  });
  app.get('/static/css/main.a1524731.chunk.css.map', cache('5 minutes'), (req, res) => {
    res.sendFile(path.join(__dirname, '../testdapp/static/css/main.a1524731.chunk.css.map'));
  });

  // LINK UI
  app.get('/', cache('5 minutes'), (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
  app.get('*', cache('5 minutes'), (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
};
