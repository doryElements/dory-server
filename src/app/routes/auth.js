// Logger
const logger = require('../logger');

const Router = require('koa-router');
const router = new Router();

const ms = require('ms');

// Auth
const auth = require('../security/auth');

// Config
const config = require('../config');

// POST /login
router.post('/login', auth.authenticateLocal() , (ctx, next) => {
    const payload = ctx.state.user;
    ctx.body ={
        user: payload.context.user
    };
});


module.exports = router;