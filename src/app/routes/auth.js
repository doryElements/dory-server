// Logger
const logger = require('../logger');

const Router = require('koa-router');
const router = new Router();

const ms = require('ms');

// Auth
const auth = require('../security/auth');
const jwt = require('jsonwebtoken');

// Config
const config = require('../config');

// POST /login
router.post('/login', auth.authenticateLocal() , (ctx, next) => {
    const payload = ctx.state.user;
    const token = jwt.sign(payload, config.jwt.jwtSecret);
    ctx.body ={
        token: token
    };
    ctx.set('Access-token', token);
    ctx.cookies.set(config.jwt.cookieName, token, { httpOnly: true, secure: true, expires : new Date(Date.now()+ms(config.jwt.expiration))});
});


module.exports = router;