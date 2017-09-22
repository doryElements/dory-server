// Logger
const logger = require('../logger');

const Router = require('koa-router');
const router = new Router({
    prefix: '/profiles',
});

const User = require('../models/user');

router.get('/', (ctx, next) => {
    // console.log('req keys', Object.keys(req));
    // console.log('req authInfo',req.authInfo);
    ctx.body ={message: 'ok', user: ctx.state.user.context.user, jwt: ctx.state.authInfo};
});

/**
 * Change password
 */
router.put('/password', (ctx, next) => {
    const user = ctx.state.user;
    const userId = user.sub;
    const version = ctx.query.version;
    const body = ctx.request.body;
    const password = body.password;
    console.log('Current user', userId);
    return User.changePassword(password, userId, version).then((result)=> {
        ctx.body ={response: result};
        return result;
    });
});

module.exports = router;
