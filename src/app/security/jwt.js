// Logger
const logger = require('../logger');
const koaJwt = require('koa-jwt');

const uuidv4 = require('uuid/v4');
const ms = require('ms');

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Config
const config = require('../config');
const expirationTimeInMs = ms(config.jwt.expiration);

module.exports.decoder = function(opt) {
    return koaJwt(Object.assign({
        secret: config.jwt.jwtSecret, // Should not be hardcoded
        cookie: config.jwt.cookieName,
        tokenKey: 'jwtToken',
    }, opt));
};


/**
 * A JSON numeric value representing the number of seconds
 * from 1970-01-01T00:00:00Z UTC
 * until the specified UTC date/time, ignoring leap seconds.
 * This is equivalent to the IEEE Std 1003.1,
 * 2013 Edition [POSIX.1] definition "Seconds Since the Epoch",
 * in which each day is accounted for by exactly 86400 seconds,
 * other than that non-integer values can be represented.
 * See RFC 3339 [RFC3339] for details regarding
 * date/times in general and UTC in particular.
 * @param {number} now - Date with default value Date.now()
 * @return {object}
 */
function genJwtExpirationData(now = Date.now()) {
    const iat = Math.floor(now / 1000);
    const exp = Math.floor((now + expirationTimeInMs) / 1000);
    return {exp, iat};
}

/**
 * Create JWT sessions paylad
 * @param {object} user
 * @return {object} JWT payload
 */
function createTokenPayload(user) {
    const payload = Object.assign({
        jit: uuidv4(),
        iss: 'dory-server',
        aud: 'dory',
        sub: user.id,
        context: {
            user: {
                name: user.name,
                email: user.email,
            },
        },
        roles: user.secured.roles,
    }, genJwtExpirationData());
    return payload;
}


function isNeedRegenToken(payload) {
    const now = Date.now();
    const nowInS = now / 1000;
    // Check Hash Payload
    const contextHash = crypto.createHash('md5')
        .update(JSON.stringify(payload.context))
        .digest('hex');
    let isRegen = (payload.contextHash !== contextHash);
    if (!isRegen) {
        // Check 60% Time expiration of Payload
        isRegen = nowInS > (payload.iat + (0.6 * (payload.exp - payload.iat)));
    }
    if (isRegen) {
        return {now, contextHash};
    }
    return undefined;
}

module.exports.encodeJwtTokenInHeadersCookies = function() {
    return function encodeJwtTokenInHeadersCookies(ctx, next) {
        return next().then(() => {
            let payload = ctx.state.user;
            if (payload) {
                let token = ctx.state.jwtToken;
                const isNeedRegen = isNeedRegenToken(payload);
                if (!token || isNeedRegen) {
                    const {now, contextHash} = isNeedRegen;
                    payload = Object.assign({}, payload, genJwtExpirationData(now), {contextHash});
                    ctx.state.user = payload;
                    token = jwt.sign(payload, config.jwt.jwtSecret);
                    logger.debug('Re generate token : ', {token, contextHash});
                }
                // JWT send in Headers
                ctx.set('Access-token', token);
                // JWT send in Cookies
                if (config.jwt.cookieName) {
                    ctx.cookies.set(config.jwt.cookieName, token, {
                        httpOnly: true,
                        secure: true,
                        expires: new Date(payload.exp * 1000),
                    });
                }
            }
        });
    };
};
module.exports.createTokenPayload = createTokenPayload;
