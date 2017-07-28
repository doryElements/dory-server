// Logger
const logger = require('../logger');

const Router = require('koa-router');
const router = new Router({
    prefix: '/profiles'
});
// const User = require('../models/users');

router.get('/',  (ctx,next) => {
    // console.log('req keys', Object.keys(req));
    // console.log('req authInfo',req.authInfo);
    ctx.body ={message: 'ok', user: ctx.user, jwt: ctx.authInfo};
});



module.exports = router;
