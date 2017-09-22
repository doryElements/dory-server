const winston = require('winston');
const config = require('./config');
require('winston-daily-rotate-file');

const fs = require('fs');
const path = require('path');

// ensure log directory exists
const logDirectory = path.join(__dirname, '..', '..', 'log');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);


winston.addColors({
    debug: 'green',
    info: 'cyan',
    silly: 'purple',
    trace: 'magenta',
    verbose: 'magenta',
    warn: 'yellow',
    warning: 'yellow',
    error: 'red',
});

const logger = new winston.Logger({
    transports: [
        new (winston.transports.Console)({
            level: config.logging.console.level,
            handleExceptions: true,
            prettyPrint: true,
            silent: false,
            timestamp: false,
            colorize: true,
            json: false,
        }),
        new (winston.transports.DailyRotateFile)({
            level: config.logging.file.level,
            filename: 'dory.log',
            dirname: logDirectory,
            json: false,
            zippedArchive: true,
        }),
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({
            level: 'warn',
            handleExceptions: true,
            prettyPrint: true,
            silent: false,
            timestamp: true,
            colorize: true,
            json: false,
        }),
    ],
    levels: {error: 0, warn: 1, info: 2, verbose: 3, debug: 4, trace: 5},
});


module.exports = logger;
module.exports.stream = {
    write: function(message, encoding) {
        logger.info(message);
    },
};
module.exports.logDirectory = logDirectory;
