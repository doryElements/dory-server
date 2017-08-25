// Logger
const logger = require('../logger');

const Router = require('koa-router');
const router = new Router({
    prefix: '/users'
});

const User = require('../models/user');
const userData = require('../userData').users;

router.get('/',  (ctx, next) => {
    // console.log('req keys', Object.keys(req));
    // console.log('req authInfo',req.authInfo);
    ctx.body ={message: 'ok', user: ctx.user, jwt: ctx.authInfo};
});



router.put('/:id/password', (ctx, next) => {
    const password = 'coucou';
    return User.hashPasswordPromise(password).then(hash=> {
        ctx.body ={message: 'TODO change password', password, hash};
        return hash;
    });
});

module.exports = router;
