/* eslint-disable no-await-in-loop */
const config = require('config');
const log = require('../lib/log');
const serviceHelper = require('./serviceHelper');

const mainCollection = config.database.collections.data;
const discCollection = config.database.collections.disc;

async function processAdapter(req, res) {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    try {
      const processedBody = serviceHelper.ensureObject(body);
      if (!processedBody.operationid) {
        throw new Error('No operationid specified');
      }
      // update the operation in database
      const db = serviceHelper.databaseConnection();
      const database = db.db(config.database.database);
      const query = {
        operationid: processedBody.operationid,
      };
      const update = { $set: processedBody }; // this will keep any previous addresses not present in the record
      const options = {
        upsert: true,
      };
      await serviceHelper.updateOneInDatabase(database, mainCollection, query, update, options);
      const succMess = serviceHelper.createSuccessMessage('data updated');
      res.json(succMess);
    } catch (error) {
      log.error(error);
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
    }
  });
}

async function operationStatus(req, res) {
  try {
    let { operationid } = req.params; // we accept both help/command and help?command=getinfo
    operationid = operationid || req.query.operationid;
    if (!operationid) {
      throw new Error('No operationid specified');
    }
    const db = serviceHelper.databaseConnection();
    const database = db.db(config.database.database);
    const query = {
      operationid,
    };
    const projection = {
      projection: {
        _id: 0,
      },
    };
    const status = await serviceHelper.findOneInDatabase(database, mainCollection, query, projection);
    if (!status) {
      throw new Error('Operation not found');
    } else {
      const dataMessage = serviceHelper.createDataMessage(status);
      res.json(dataMessage);
    }
  } catch (error) {
    log.error(error);
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
  }
}

async function adapterStatus(req, res) {
  try {
    let { adapterid } = req.params; // we accept both help/command and help?command=getinfo
    adapterid = adapterid || req.query.adapterid;
    if (!adapterid) {
      throw new Error('No adapter specified');
    }
    const db = serviceHelper.databaseConnection();
    const database = db.db(config.database.database);
    const query = {
      adapterid,
    };
    const projection = {
      projection: {
        _id: 0,
      },
    };
    const adapter = await serviceHelper.findOneInDatabase(database, discCollection, query, projection);
    if (adapter) {
      res.json(adapter.status);
    } else {
      res.json('connected');
    }
  } catch (error) {
    log.error(error);
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
  }
}

async function zelcoreAsksDisconnect(req, res) {
  try {
    let { adapterid } = req.params; // we accept both help/command and help?command=getinfo
    adapterid = adapterid || req.query.adapterid;
    if (!adapterid) {
      throw new Error('No adapter specified');
    }
    const db = serviceHelper.databaseConnection();
    const database = db.db(config.database.database);
    const createdAt = new Date().getTime();
    const detail = {
      createdAt,
      adapterid,
      status: 'disconnect',
    };
    await serviceHelper.insertOneToDatabase(database, discCollection, detail);
    const errMessage = serviceHelper.createSuccessMessage('disconnected');
    res.json(errMessage);
  } catch (error) {
    log.error(error);
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
  }
}

async function doIndexes() {
  try {
    log.info('Creation of collection indexes');
    const db = serviceHelper.databaseConnection();
    const database = db.db(config.database.database);
    await database.collection(mainCollection).createIndex({ createdAt: 1 }, { expireAfterSeconds: 900 });
    await database.collection(discCollection).createIndex({ createdAt: 1 }, { expireAfterSeconds: 900 });
    log.info('Collection indexes created.');
  } catch (error) {
    log.error(error); // failiure is ok, continue
  }
}

module.exports = {
  doIndexes,
  zelcoreAsksDisconnect,
  adapterStatus,
  operationStatus,
  processAdapter,
};
