'use strict';

const express = require('express');
const bodyParser  = require('body-parser');
const cors = require('cors');

// const jwt = require("jwt-simple");
const jwt = require('jsonwebtoken');
const auth = require("./auth.js")();
const uuidv4 = require('uuid/v4');

// Login
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');

// Deps
const User = require("./users.js");
const cfg = require("./config.js");
// Instanciate
const app = express();
const port = process.env.PORT || 8181;


// =======================
// === Express Config
// =======================
// Log config
const logDirectory = path.join(__dirname, 'log');
// create a rotating write stream
const accessLogStream = rfs('access.log', {
    interval: '1d', // rotate daily
    path: logDirectory
});
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

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
app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.disable('x-powered-by');


// =======================
// routes
// =======================
// basic route
app.get('/',  (req, res) =>  {
    res.json({
        status: "My API is alive!"
    });
});

app.get("/user", auth.authenticate(), function(req, res) {
    console.log('req keys', Object.keys(req));
    console.log('req authInfo',req.authInfo);
    res.json({ message: 'ok', user: req.user.profile, jwt: req.authInfo });
    // res.json(users[req.user.id]);
});

app.post("/token", function(req, res) {
    if (req.body.email && req.body.password) {
        const email = req.body.email;
        const password = req.body.password;
        const user = User.findByEmail({email});
        if( ! user ){
            res.status(401).json({message:"no such user found"});
        }
        if (user.private.password === password) {
            const payload = {
                 jit: uuidv4(),
                iss: "dory-server",
                sub: user.id,
                aud: "dory",
                name: user.name,
                email: user.email
            };
            const token = jwt.sign(payload, cfg.jwtSecret);
            res.json({
                massage: "ok",
                token: token
            });
        } else {
            res.sendStatus(401).json({ message:"Password did not match"} );
        }
    } else {
        res.sendStatus(401);
    }
});

// =======================
// start the server ======
// =======================
app.listen(port, () => {
    console.log('Magic  happens at http://localhost:' + port);
});

module.exports = app;