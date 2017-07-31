// Logger
const logger = require('../logger');
// Passport
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;

const uuidv4 = require('uuid/v4');

const User = require("../models/user");


function createTokenPayload(user) {
    // A JSON numeric value representing the number of seconds from 1970-01-01T00:00:00Z UTC until the specified UTC date/time, ignoring leap seconds.
    // This is equivalent to the IEEE Std 1003.1, 2013 Edition [POSIX.1] definition "Seconds Since the Epoch", in which each day is accounted for by exactly 86400 seconds, other than that non-integer values can be represented.
    // See RFC 3339 [RFC3339] for details regarding date/times in general and UTC in particular.
    const iat = Math.floor(Date.now() / 1000);
    // Signing a token with 1 hour of expiration:
    const exp = iat + (60 * 60);
    const payload = {
        jit: uuidv4(),
        iss: "dory-server",
        aud: "dory",
        iat: iat,
        exp: exp,
        sub: user.id,
        name: user.name,
        email: user.email,
        roles: user.secured.roles
    };
    return payload;
}

// passport.serializeUser(function(user, done) {
//     done(null, user.id)
// })

function strategyValidateUsernamePassword(username, password, done) {
    const email = username;
    // logger.debug('strategyValidateUsernamePassword', username);
    User.getByEmail({email, secured: true})
        .then(user => {
            if (!user) {
                return done(null, false, {message: 'Incorrect username.'});
            }
            if (!User.validatePassword(user.secured.password, password)) {
                return done(null, false, {message: 'Incorrect password.'});
            }
            const payload = createTokenPayload(user);
            // const secureUser = cleanUserSecured(user);
            // logger.info('Login strategy for ', secureUser);
            return done(null, payload);
        }).catch(err => {
        return done(null, false, {message: err.message});
    });
}

passport.use(new LocalStrategy(strategyValidateUsernamePassword));


module.exports = {
    initialize: () => {
        return passport.initialize();
    },
    authenticateLocal: function () {
        return passport.authenticate('local', {session: false});
    }

};