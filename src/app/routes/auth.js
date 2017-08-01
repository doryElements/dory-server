// Logger
const logger = require('../logger');

const Router = require('koa-router');
const router = new Router();

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
    ctx.cookies.set('Access-token', token, { httpOnly: true, secure: true  });
});


module.exports = router;