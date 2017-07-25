// Logger
const logger = require('../logger');
const config = require('../config');
const elasticsearch = require('elasticsearch');

const elasticConfig =config.elasticsearch;

const elasticClient = new elasticsearch.Client(elasticConfig);

module.exports = elasticClient;
