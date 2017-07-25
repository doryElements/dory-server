// Logger
const logger = require('../logger');
const config = require('../config');
const elasticsearch = require('elasticsearch');

const elasticConfig = config.elasticsearch;

const elasticClient = new elasticsearch.Client(getClientSettings(elasticConfig));

function LogClass(config) {
    const log = logger;
    this.error = log.error.bind(log);
    this.warning = log.warn.bind(log);
    this.info = log.info.bind(log);
    this.debug = log.debug.bind(log);
    // this.trace = function (method, requestUrl, body, responseBody, responseStatus) {
    //     log.trace({
    //         method: method,
    //         requestUrl: requestUrl,
    //         body: body,
    //         responseBody: responseBody,
    //         responseStatus: responseStatus
    //     });
    // };
    this.trace = function (method, req, body, res, status) {
        const parts = req.path.split('/');
        const meta = {
            host: req.protocol + '//' + req.hostname + ':' + req.port,
            index: parts[1] || '',
            type: parts[2] || '',
            response: status,
            queryString: parts[parts.length - 1],
            queryBody: body || ''
        };
        if (status !== 200) {
            meta.responseBody = res;
            log.trace('[ELASTICSEARCH] ' + method + ' @ ', meta);
        }
    };
    this.close = function () {
    };
}

function getClientSettings(options) {
    let config = options;
    if (options.logging) {
        config = Object.assign({}, config, {log: LogClass});
        delete config.logging;
    }
    logger.debug('Elastic client config', config);
    return config;
}


module.exports = elasticClient;
