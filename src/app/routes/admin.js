// Logger
// const logger = require('../logger');

const Router = require('koa-router');
const router = new Router({
    prefix: '/admin',
});

const Sam = require('../models/sam');
const User = require('../models/user');
const userData = require('../userData').users;


router.get('/users/init', (ctx, next) => {
   return User.createIndexMappingIndex()
        .then((result) => userData.map((user) => User.create(user) ) )
        .then((promises) => Promise.all(promises))
        .then((results) => ctx.body =results);
});

router.get('/sams/init', (ctx, next) => {
    return Sam.createIndexMappingIndex()
        .then((results) => ctx.body =results);
});


module.exports = router;
