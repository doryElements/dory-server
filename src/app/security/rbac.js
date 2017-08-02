const logger = require('../logger');
const rbac = require('koa-rbac');
const Provider = require('rbac-a').Provider;

const rules = require('./access-rules');


class CustomProvider extends Provider {


    getRoles(user) {
        logger.debug('CustomProvider getRoles user', user);
        return new Promise((resolve, reject) => {
            const roles = user.roles;
            logger.debug('CustomProvider getRoles user', user, '==+> ', roles);
            resolve(roles);
        });
    }
    getPermissions(role) {
        logger.debug('CustomProvider getPermissions roles', role);
        return [role];
    }
    getAttributes(role) {
        logger.debug('CustomProvider getAttributes roles', role);
        return [];
    }
}

class CompositeProvider extends Provider {

    constructor(options) {
        super();
        this.custom = new CustomProvider(options);
        this.json = new rbac.RBAC.providers.JsonProvider(rules);
    }

    getRoles(user) {
        // NOTE : ignore JSON provider, here
        logger.debug('user roles', this.custom.getRoles(user) );
        return this.custom.getRoles(user);
    }

    getPermissions(role) {
        logger.debug('getPermissions role', role );
        return Promise.all([
            this.json.getPermissions(role),
            this.custom.getPermissions(role)
        ]).then(function (permissionLists) {
            const jsonPermissions = permissionLists[0] || [];
            const customPermissions = permissionLists[1] || [];
            return jsonPermissions.push.apply(jsonPermissions, customPermissions);
        });
    }

    getAttributes(role) {
        // NOTE : ignore custom provider, here
        logger.debug('getAttributes roles', role );
        return this.json.getAttributes(role);
    }
}

const options = {
    rbac: new rbac.RBAC({
        provider: new CompositeProvider(rules)
    }),
    identity: function (ctx) {
        return ctx && ctx.state && ctx.state.user;
    }
    // identity(ctx) { return ctx && ctx.user } // passes `user` to rbac-a provider
    // restrictionHandler(ctx, permissions, redirectUrl) { ctx.status = 403; }   // manually handle restricted responses
};


module.exports.middleware = rbac.middleware(options);
module.exports.check = rbac.check;
module.exports.rbac = rbac;