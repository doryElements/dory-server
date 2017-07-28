// Logger
const logger = require('../logger');

const Router = require('koa-router');
const router = new Router();

// Routes
const samRoute = require('./sam');
const userRoute = require('./user');
const profileRoute = require('./profile');

router.use('/api', samRoute.routes(), samRoute.allowedMethods());
router.use('/api', userRoute.routes(), userRoute.allowedMethods());
router.use('/api', profileRoute.routes(), profileRoute.allowedMethods());


module.exports = router;
