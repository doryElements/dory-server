// Logger
const logger = require('../logger');
// Passport
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;

const jwtSecurity = require('./jwt');

const config = require("../config");
const User = require("../models/user");




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
            const payload = jwtSecurity.createTokenPayload(user);
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