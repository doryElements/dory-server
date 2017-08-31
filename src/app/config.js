// config.js

const configDory =  {
    jwt: {
        jwtSecret: 'superman est ridicule en collant de fille',
        expiration: '30m',
        cookieName : 'dory-session'
    },
    elasticsearch: {
        host: 'es:9200',
        log: 'info',
        keepAlive: true
    },
    logging: {
        elasticsearch: true,
        file: {
            level: 'info'
        },
        console: {
            level: 'debug'
        }
    },
    web: {
        folder: '../dory-app'
    }
};

// delete configDory.jwt.cookieName;

module.exports = configDory;