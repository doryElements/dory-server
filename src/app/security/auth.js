// Logger
const logger = require('../logger');
// Passport
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;

const jwtSecurity = require('./jwt');

const User = require('../models/user');


// passport.serializeUser(function(user, done) {
//     done(null, user.id)
// })




/**
 * Validate Login/password in DB
 * @param {string} username - Login
 * @param {string} password - Password
 * @param {function} done passport done Callback
 */
function strategyValidateUsernamePassword(username, password, done) {
    const email = username;
    // logger.debug('strategyValidateUsernamePassword', username);
    logger.info('Try login with ', username, '=', 'xxxxxx');
    User.getByEmail({email, secured: true}).then((user) => {
        if (!user) {
            throw new Error('Incorrect username.');
        }
        return [user, User.comparePasswordPromise(password, user.secured.password)];
    }).then((promises) => Promise.all(promises))
        .then(([user, validPassword]) => {
            if (!validPassword) {
                throw new Error('Incorrect password.');
            }
            const payload = jwtSecurity.createTokenPayload(user);
            return done(null, payload);
        }).catch((err) => {
        logger.warn('Login Error', err.message);
        return done(null, false, {message: err.message});
    });
};

passport.use(new LocalStrategy(strategyValidateUsernamePassword));


module.exports = {
    initialize: () => {
        return passport.initialize();
    },
    authenticateLocal: () => {
        return passport.authenticate('local', {session: false});
    },

};
