// auth.js
const passport = require("passport");
const passportJWT = require("passport-jwt");




const User = require("./users.js");
const cfg = require("./config.js");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;


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



module.exports = function() {

    const strategyJwt = new JwtStrategy(jwtOptions, (payload, done) => {
        const user = User.findOne({id: payload.sub});
            // if (err) {
            //     return done(err, false);
            // }
            if (user) {
                const cloneUser = JSON.parse(JSON.stringify(user));
                delete cloneUser.private;
                // const jwtSession = {
                //     profile: cloneUser,
                //     jwt: payload
                // }
                return done(null, cloneUser, payload);
            } else {
                return done(null, false);
                // or you could create a new account
            }

    });

    passport.use(strategyJwt);
    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
            return passport.authenticate("jwt", cfg.jwtSession);
        }
    };
};