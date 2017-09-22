'use strict';

/**
 * Utils dependencies.
 */
// Utils
const fs = require('fs');
const path = require('path');
// Logger
const logger = require('./logger');
//Server
const http2 = require('http2');
const events = require('events');
/**
 * Koa dependencies.
 */
const Koa = require('koa');
const koaBody = require('koa-body');
const serve = require('koa-static');
const unless = require('koa-unless');
const responseTime = require('koa-response-time');
const compress = require('koa-compress');
// const ratelimit = require('koa-ratelimit');


/**
 * Project dependencies.
 */
// Config
const config = require('./config');
// Security
const encodeJwtTokenInHeadersCookies = require('./security/jwt').encodeJwtTokenInHeadersCookies();
// const rbacMiddleware = require('./security/rbac').middleware;
// Routes
const apiRoutes = require('./routes/index');

/**
 * Environment.
 */

const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 8181;


// Config NodesJs
events.EventEmitter.defaultMaxListeners = 0;


/**
 * Koa Server.
 */
const app = new Koa();

app.use(responseTime());
app.use(compress());
app.use(koaBody());

/**
 * CSV Parser to use the first time you launch the server
 */
// const parser = require('./CSV-parse'


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

// const conditional = require('koa-conditional-get');
// const etag = require('koa-etag');

// app.use(conditional());
// app.use(etag());

// serve staticfiles
 const staticDirectory =  path.normalize( config.web.folder);
logger.info('Serve static file ', staticDirectory, path.resolve(staticDirectory));
const staticWeb =serve(staticDirectory);
staticWeb.unless = unless;
app.use(staticWeb.unless({path: ['/api']}));

// Security
app.use(encodeJwtTokenInHeadersCookies);
// app.use(rbacMiddleware);

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


// Start Listeners
http2.createServer(certs, app.callback()).listen(port, () => {
    logger.info('Magic  happens at https://localhost:' + port);
});
app.listen(8080, () => {
    logger.info('Magic  happens at http://localhost:' + 8080);
});