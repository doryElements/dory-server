'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const jwt = require('jsonwebtoken');
const auth = require("./auth.js")();
const uuidv4 = require('uuid/v4');

// Logger
const logger = require('./logger');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');

// Deps
const cfg = require("./config.js");
// Instanciate
const app = express();
const port = process.env.PORT || 8181;

const routeProfile = require('./routes/profile');
const routeUser = require('./routes/user');
const routeSam = require('./routes/sam');

const User = require("./models/user");

// const parser = require('./CSV-parse');

// =======================
// === Express Config
// =======================
// Log config
const logDirectory = logger.logDirectory;
// create a rotating write stream
const accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
});

// app.use(morgan('combined', { 'stream': logger.stream}));
app.use(morgan('combined', {stream: accessLogStream}));
app.use(morgan('dev'));
app.use(cors());

// Express
app.use(auth.initialize());
const options = {
    inflate: true,
    limit: '100kb',
    type: 'application/json'
};
app.use(bodyParser.json(options));
app.use(bodyParser.urlencoded({extended: false})); // Parses urlencoded bodies
app.disable('x-powered-by');


// =======================
// Tokens
// =======================
// app.use(function(req, res, next){
//     res.on('close', function(){
//         const payload = req.authInfo;
//         console.log('---------------- = req.authInfo', payload);
//         if (payload) {
//             const token = jwt.sign(payload, cfg.jwtSecret);
//             console.log("---------------- Set header token  " + token); // for example
//             res.set('access_token ', token);
//         }
//     });
//     next();
// });

// =======================
// routes
// =======================
// basic route
app.get('/', (req, res) => {
    res.json({
        status: "It's Alive! My API is alive!"
    });
});

app.use('/api/users', routeUser);
app.use('/api/profile',  auth.authenticate(), routeProfile);
app.use('/api/sams',  auth.authenticate(), routeSam);


app.post("/api/login", auth.authenticateLocal(), function (req, res) {
    const payload = req.authInfo;
        const token = jwt.sign(payload, cfg.jwtSecret);
        res.json({
            message: "ok",
            token: token
        });
});


// =======================
// start the server ======
// =======================
app.listen(port, () => {
    logger.info('Magic  happens at http://localhost:' + port);
});

module.exports = app;