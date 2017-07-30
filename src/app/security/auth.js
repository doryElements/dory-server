// Logger
const logger = require('../logger');
// Passport
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;

const uuidv4 = require('uuid/v4');

const User = require("../models/user");


function cleanUserSecured(user) {
    const cloneUser = JSON.parse(JSON.stringify(user));
    delete cloneUser.secured;
    return cloneUser;
};

function createTokenPayload(user) {
    const payload = {
        jit: uuidv4(),
        iss: "dory-server",
        sub: user.id,
        aud: "dory",
        name: user.name,
        email: user.email
    };
    return payload;
}

passport.serializeUser(function(user, done) {
    done(null, user.id)
})

function strategyValidateUsernamePassword(username, password, done) {
    const email = username;
    logger.debug('strategyValidateUsernamePassword', username);
    User.getByEmail({email, secured: true})
        .then(user => {
            if (!user) {
                return done(null, false, {message: 'Incorrect username.'});
            }
            if (!User.validatePassword(user.secured.password, password)) {
                return done(null, false, {message: 'Incorrect password.'});
            }
            const payload = createTokenPayload(user);
            const secureUser = cleanUserSecured(user);
            logger.info('Login strategy for ', secureUser);
            return done(null, secureUser, payload);
        });
}

passport.use(new LocalStrategy(strategyValidateUsernamePassword));


module.exports =   {
        initialize: () => {
            return passport.initialize();
        },
        authenticateLocal: function() {
            return passport.authenticate('local', { session: false});
        }

};