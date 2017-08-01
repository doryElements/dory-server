// Logger
const logger = require('../logger');
const koaJwt = require('koa-jwt');

const config = require('../config');

module.exports = koaJwt({
    secret: config.jwt.jwtSecret, // Should not be hardcoded
    cookie: config.jwt.cookieName,
    debug: true
});