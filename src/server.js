'use strict';


const express = require('express');
const app = express();
const bodyParser  = require('body-parser');

const port = process.env.PORT || 8080;


// =======================
// routes ================
// =======================
// basic route
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});


// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);