const logger = require('../logger');
const Router = require('koa-router');


function crudRouter(Model) {
    const router = new Router();

    /**
     * Validate
     */
    router.post('/validate', (ctx, next) => {
        const body = ctx.request.body;
        return Model.validate(body).then((result) => {
            ctx.body = result;
            return result;
        });
    });

    /**
     * Get By Id
     */
    router.get('/:id', (ctx, next) => {
        const id = ctx.params.id;
        const version = ctx.query.version;
        return Model.getById({id, version}).then((result) => {
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
        return Model.delete(id, version).then((result) => {
            ctx.body = {message: 'delete', result};
            return result;
        });
    });


    /**
     * Create
     */
    router.post('/', (ctx, next) => {
        const body = ctx.request.body;
        return Model.create(body)
            .then((result) => {
                ctx.body = result;
                if (result.created) {
                    delete result.created;
                    ctx.status = 201;
                }
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
        return Model.update(body, id, version)
            .then((result) => {
                if (result.created) {
                    delete result.created;
                    ctx.status = 201;
                }
                ctx.body = result;
                return result;
            });
    });


    return router;
}


module.exports = crudRouter;
