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
    const queryString = ctx.query;
    return Sam.getByParams(queryString.app, queryString.size, queryString.from).then(result =>{
        ctx.body = result;
        return result;
    });
});

/**
 * Get all servers
 */
router.get('/servers',(ctx,next)=>{
    return Sam.getServers().then(result => {
        ctx.body = result;
        return result;
    });
});

/**
 * Get all databases
 */
router.get('/dbs',(ctx,next)=>{
    return Sam.getDatabases().then(result => {
        ctx.body = result;
        return result;
    });
});

/**
 * Get app names for dropdown menu
 */
router.get('/options',(ctx,next) => {
   return Sam.getNames().then(result => {
       ctx.body = result;
       return result;
   });
});

/**
 * Get relations of an app
 */
// router.get('/relatives/:id',(ctx,next) => {
//     const id= ctx.params.id;
//     return Sam.getRelatives(id).then(result => {
//         ctx.body = result;
//         return result;
//     });
// });

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
 * Create
 */
router.post('/',  (ctx, next) => {
    logger.debug('---------- state', ctx.state);
    const body = Sam.adaptBody(ctx.request.body);

    // if(Sam.appExists(body.app)){
    //     ctx.body= {error:'App already exist'};
    //     ctx.status= 422;
    //     logger.debug('Trying to create an app already existing');
    //     return ctx.body;
    // }
    // else{
        return Sam.create(body)
            .then(result => {
                ctx.body = result;
                if (result.created) {
                    delete result.created;
                    ctx.status = 201;
                }
                return result;
            });
    // }
    //
    // Sam.appExists(body.app)
    //     .then(result => {
    //         if(result){
    //             ctx.body= {error:'App already exist'};
    //             ctx.status= 422;
    //             logger.debug('Trying to create an app already existing');
    //             return ctx.body;
    //         }
    //         else{
    //             logger.debug('Creating',body.app);
    //             return Sam.create(body)
    //                 .then(result => {
    //                     ctx.body = result;
    //                     if (result.created) {
    //                         delete result.created;
    //                         ctx.status = 201;
    //                     }
    //                     return result;
    //                 });
    //         }
    //     });
});

/**
 * Update By Id
 */
router.put('/:id', (ctx, next) => {
    const id = ctx.params.id;
    const version = ctx.query.version;
    const body = Sam.adaptBody(ctx.request.body);
    return Sam.update(body, id, version)
        .then(result => {
            if (result.created) {
                delete result.created;
                ctx.status = 201;
            }
            ctx.body = result;
            return result;
        });
});


module.exports = router;
