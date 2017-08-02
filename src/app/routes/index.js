// Logger
const logger = require('../logger');

const Router = require('koa-router');
const router = new Router({
    prefix: '/api'
});

// Security
const jwtDecoder = require('../security/jwt').decoder();
const rbac = require('../security/rbac');

// Routes
const samRoute = require('./sam');
const userRoute = require('./user');
const profileRoute = require('./profile');
const authRoute = require('./auth');

// Auth Routes
router.use( authRoute.routes(), authRoute.allowedMethods());

// Api Secured routes
const securedRoutes = [samRoute, userRoute, profileRoute];
// const check = rbac.check({'allow': 'admin'});

function traceMd(ctx, next) {
    logger.debug('--------------- traceMd state ', JSON.stringify( ctx.state));
    return next();
}

securedRoutes.forEach(rt=> {
    router.use( jwtDecoder, traceMd,  rbac.check({'allow': 'admin2'}),     rt.routes(), rt.allowedMethods());
});


module.exports = router;
