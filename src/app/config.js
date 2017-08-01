// config.js
module.exports = {
    jwt: {
        jwtSecret: 'superman est ridicule en collant de fille',
        expiration: '30m',
        jwtSession: {
            session: false
        },
    },
    elasticsearch: {
        host: 'localhost:9200',
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
    }
};