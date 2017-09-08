// Logger
const logger = require('../logger');

const Router = require('koa-router');
const router = new Router({
    prefix: '/users'
});

const User = require('../models/user');
const crudRouter = require('./crudRouter')(User);


/**
 * Search User
 */
router.get('/', (ctx, next) => {
    const queryString = ctx.query;
    return User.searchUserByText(queryString.search, queryString.size, queryString.from).then(result =>{
        ctx.body = result;
        return result;
    });
});

/**
 * Change password
 */
router.put('/:id/password', (ctx, next) => {
    const password = 'coucou';
    const body = ctx.request.body;
    return User.hashPasswordPromise(password).then(hash=> {
        ctx.body ={message: 'TODO change password', password, hash};
        return hash;
    });
});



/**
 * Crud User
 */
router.use(crudRouter.routes());


module.exports = router;
