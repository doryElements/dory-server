'use strict';

// Utils
const fs = require('fs');
const path = require('path');

// Logger
const logger = require('./logger');

//Server
const http = require('http');
const http2 = require('http2');

const Koa = require('koa');
// const jwt = require('koa-jwt');
const app = new Koa();
const koaBody = require('koa-body');
const serve = require('koa-static');

// Routes
const apiRoutes = require('./routes/index');

// Koa Config
const port = process.env.PORT || 8181;
app.use(koaBody());

// Config
const config = require('./config');
const jwt = require('jsonwebtoken');
const ms = require('ms');

// look ma, error propagation!
app.use((ctx, next) => {
    return next().catch((err) => {
        ctx.status = err.status || 500;
        ctx.body = {message: err.message, status: ctx.status, errors: err.errors};
        // since we handled this manually we'll want to delegate to the regular app
        // level error handling as well so that centralized still functions correctly.
        ctx.app.emit('error', err, ctx);
        // logger.error(err);
    });
});

// Token/Cookie update middleware
app.use((ctx,next) => {
    let token = ctx.cookies.get(config.jwt.cookieName);
    if(token && jwt.verify(token,config.jwt.jwtSecret)){
        logger.debug('Update cookie and token');
        logger.debug('Token',jwt.decode(token,config.jwt.jwtSecret));

        let payload= jwt.decode(token,config.jwt.jwtSecret);
        payload.iat = Math.floor(Date.now() / 1000);
        payload.exp = payload.iat + ms(config.jwt.expiration);
        token = jwt.sign(payload, config.jwt.jwtSecret);

        ctx.cookies.set(config.jwt.cookieName, token, { httpOnly: true, secure: true, expires : new Date(Date.now()+ms(config.jwt.expiration))});
    }
    return next();
});


// serve staticfiles from ./public
const staticDirectory = path.join(__dirname, '..', 'web');
logger.info('Serve static file ', staticDirectory);
app.use(serve(staticDirectory));

// Api Routes
app.use(apiRoutes.routes()).use(apiRoutes.allowedMethods());


// =======================
// start the server ======
// =======================
const certsDirectory = path.join(__dirname, '..', 'certs');
const certs = {
    key: fs.readFileSync(path.join(certsDirectory, 'server.key')),
    cert: fs.readFileSync(path.join(certsDirectory, 'server.crt'))
};

http2.createServer(certs, app.callback()).listen(port, () => {
    logger.info('Magic  happens at https://localhost:' + port);
});