var express = require('express');
var app = express();
var cors = require('cors');

app.use(cors());
  

var UserController = require('./user/UserController');
app.use('/users', UserController);

var AuthController = require('./auth/AuthController');
app.use('/api/auth', cors(), AuthController);

module.exports = app;