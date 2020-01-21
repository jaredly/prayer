// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();

app.use(express.static('public'));

console.log('hello');
const Gun = require('gun');
var server = require('http')
    .createServer(app)
    .listen(process.env.PORT || 9103);
var gun = Gun({ ws: { server, path: '/gunz' }, file: '.data' });
