// Logger
const logger = require('../logger');

const Router = require('koa-router');
const router = new Router({
    prefix: '/sams'
});

const Sam = require('../models/sam');


// const manageError= function(ctx, next) {
//     return function (err) {
//         const status = err.status || 500;
//         return res.status(status).json({status, message: err.message, errors: err.errors});
//     };
// };


/**
 * Search By Params
 */
router.get('/', (ctx, next) => {
    ctx.body = {message: 'TODO Search'};
    // const queryString = req.query;
    // Sam.getByParams(queryString.app , queryString.fields,  queryString.size, queryString.from).then(result =>{
    //     return res.json(result);
    // });
});


/**
 * Get By Id
 */
router.get('/:id', (ctx, next) => {
    const id = ctx.params.id;
    const version = ctx.query.version;
    return Sam.getById({id, version}).then(result => {
        ctx.body = result;
        return result;
    });
});


/**
 * Delete By Id
 */
router.del('/:id', (ctx, next) => {
    const id = ctx.params.id;
    const version = ctx.query.version;
    return Sam.delete(id, version).then(result => {
        ctx.body = {message: 'delete', result};
        return result;
    });

});


/**
 * Update By Id
 */
router.put('/:id', (ctx, next) => {
    const id = ctx.params.id;
    const version = ctx.query.version;
    const body = ctx.request.body;
    return Sam.validate(body)
        .then(data => Sam.update(data, id, version))
        .then(result => {
            if (result.created) {
                delete result.created;
                ctx.status = 201;
            }
            ctx.body = result;
            return result;
        });
});


/**
 * Create
 */
router.post('/', (ctx, next) => {
    const body = ctx.request.body;
    return Sam.validate(body)
        .then(data => Sam.create(data))
        .then(result => {
            ctx.body = result;
            if (result.created) {
                delete result.created;
                ctx.status = 201;
            }
            return result;
        });

});


module.exports = router;
