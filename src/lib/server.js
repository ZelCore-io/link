const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');

const nodeEnv = process.env.NODE_ENV;

const app = express();

if (nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

app.use(cors());
const linkui = path.join(__dirname, '../../dist');
app.use(express.static(linkui));
require('../routes')(app);

module.exports = app;
