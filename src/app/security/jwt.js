// Logger
const logger = require('../logger');
const koaJwt = require('koa-jwt');

const config = require('../config');
const uuidv4 = require('uuid/v4');
const ms = require('ms');

// const crypto = require('crypto');
const jwt = require('jsonwebtoken');

module.exports.decoder = koaJwt({
    secret: config.jwt.jwtSecret, // Should not be hardcoded
    cookie: config.jwt.cookieName,
    debug: true
});



function createTokenPayload(user) {
    // A JSON numeric value representing the number of seconds from 1970-01-01T00:00:00Z UTC until the specified UTC date/time, ignoring leap seconds.
    // This is equivalent to the IEEE Std 1003.1, 2013 Edition [POSIX.1] definition "Seconds Since the Epoch", in which each day is accounted for by exactly 86400 seconds, other than that non-integer values can be represented.
    // See RFC 3339 [RFC3339] for details regarding date/times in general and UTC in particular.
    const now = Date.now();
    const iat = Math.floor(now / 1000);
    const exp =  Math.floor(now + ms(config.jwt.expiration));
    const payload = {
        jit: uuidv4(),
        iss: "dory-server",
        aud: "dory",
        iat: iat,
        exp: exp,
        sub: user.id,
        context: {
            user: {
                name: user.name,
                email: user.email
            }
        },
        roles: user.secured.roles
    };
    return payload;
}

module.exports.createTokenPayload = createTokenPayload;

module.exports.encoderMiddleware = (ctx, next) => {
    return next().then(() => {
        const payload = ctx.state.user;
        const now = Date.now();
        const expMs = now +  ms(config.jwt.expiration);
        payload.iat = Math.floor(now / 1000);
        payload.exp =  Math.floor(expMs/1000);
        const token = jwt.sign(payload, config.jwt.jwtSecret);
        ctx.set('Access-token', token);
        ctx.cookies.set(config.jwt.cookieName, token, {
            httpOnly: true,
            secure: true,
            expires: new Date(expMs)
        });
    });
};

// module.exports.encoderMiddleware = (ctx,next) => {
//     return next().then( () => {
//         const payload = ctx.state.user;
//         // Compute Hash
//         const hash =  crypto.createHmac('sha256',  config.jwt.jwtSecret)
//             .update(JSON.stringify(payload.context))
//             .digest('hex');
//         const now  = Math.floor(Date.now() / 1000);
//         if ((payload.contextHash !== hash) || (now > (payload.iat + (2*(payload.exp - payload.iat)/3)))) {
//             payload.iat = now;
//             payload.exp = payload.iat + ms(config.jwt.expiration);
//             payload.contextHash = hash;
//         }
//         const token = jwt.sign(payload, config.jwt.jwtSecret);
//         ctx.set('Access-token', token);
//         ctx.cookies.set(config.jwt.cookieName, token, { httpOnly: true, secure: true, expires : new Date(Date.now()+ms(config.jwt.expiration))});
//     });
// };