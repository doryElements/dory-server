const winston = require('winston');
require('winston-daily-rotate-file');

const fs = require('fs');
const path = require('path');

// ensure log directory exists
const logDirectory = path.join(__dirname, '..', 'log');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);


module.exports = makeLogger();

function makeLogger(){

    winston.addColors({
        debug: 'green',
        info: 'cyan',
        silly: 'purple',
        trace: 'magenta',
        verbose: 'magenta',
        warn: 'yellow',
        warning: 'yellow',
        error: 'red'
    });

    const logger = new winston.Logger({
        transports: [
            new(winston.transports.Console)({
                level: 'silly',
                handleExceptions: true,
                prettyPrint: true,
                silent: false,
                timestamp: false,
                colorize: true,
                json: false
            }),
            new (winston.transports.DailyRotateFile)({
                level: 'info',
                filename: 'dory.log',
                dirname: logDirectory,
                json: false,
                zippedArchive: true
            })
        ],
        exceptionHandlers: [
            new(winston.transports.Console)({
                level: 'warn',
                handleExceptions: true,
                prettyPrint: true,
                silent: false,
                timestamp: true,
                colorize: true,
                json: false
            })
        ]
    });
    logger.setLevels({ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 });

    return logger;
}