// Logger
const logger = require('../logger');
const koaJwt = require('koa-jwt');

const config = require('../config');

module.exports = koaJwt({
    secret: config.jwtSecret, // Should not be hardcoded
});