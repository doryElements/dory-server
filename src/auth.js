// auth.js
const passport = require("passport");
const passportJWT = require("passport-jwt");


const uuidv4 = require('uuid/v4');

const User = require("./models/users.js");
const cfg = require("./config.js");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const LocalStrategy = require('passport-local').Strategy;

// const cookieExtractor = function(req) {
//     var token = null;
//     if (req && req.cookies)
//     {
//         token = req.cookies['jwt'];
//     }
//     return token;
// };

// Option
const jwtOptions = {
    secretOrKey: cfg.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    audience: "dory"
};

const cleanUserSecured =function (user) {
    const cloneUser = JSON.parse(JSON.stringify(user));
    delete cloneUser.secured;
    return cloneUser;
};

const strategyValidateUsernamePassword= (email, password, done) => {
    console.log('strategyLocal', email);
    User.getByEmail({email, secured: true}).then(user => {
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (!User.validePassword(user.secured.password, password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        const payload = {
            jit: uuidv4(),
            iss: "dory-server",
            sub: user.id,
            aud: "dory",
            name: user.name,
            email: user.email
        };
        const secureUser = cleanUserSecured(user);
        return done(null, secureUser,payload);
    }).catch(err=> {
        return done(err);
    })
};


module.exports = function() {

    const strategyJwt = new JwtStrategy(jwtOptions, (payload, done) => {
        console.log(payload);
        User.getById({id: payload.sub}).then(user => {
            if (user) {
                const secureUser = cleanUserSecured(user);
                return done(null, secureUser, payload);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        });
            // if (err) {
            //     return done(err, false);
            // }
    });

    const strategyLocal = new LocalStrategy(strategyValidateUsernamePassword);
    passport.use('local', strategyLocal);
    passport.use(strategyJwt);
    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticateLocal: function() {
            return passport.authenticate('local', { session: false});
        },
        authenticate: function() {
            return passport.authenticate('jwt', cfg.jwtSession);
        }
    };
};