// Logger
const logger = require('../logger');

const Router = require('koa-router');
const router = new Router();

const ms = require('ms');

// Auth
const auth = require('../security/auth');

// Config
const config = require('../config');

router.post('/tokens', auth.authenticateLocal() , (ctx, next) => {
    const payload = ctx.state.user;
    ctx.body ={
        user: payload.context.user
    };
});

router.get('/logout', (ctx, next) => {
    ctx.cookies.set(config.jwt.cookieName,null);
});

module.exports = router;