// Logger
const logger = require('../logger');
const ElasticModel = require('./elasticModel');

// Config
const indexName = 'sessions';
const indexType = 'jwt';

const mapping = {
    index: indexName,
    type: indexType,
    body: {
        _all: {'enabled': false},
        properties: {
            name: {
                type: 'text',
                fields: {
                    untouched: {
                        type: 'text',
                        index: 'not_analyzed',
                    },
                },
            },
            email: {type: 'string', index: 'not_analyzed'},
            secured: {
                properties: {
                    password: {
                        type: 'string',
                        index: 'not_analyzed',
                    },
                },
            },
        },
    },
};

class TokenBlackListModel extends ElasticModel {
    constructor() {
        super({indexName, indexType, mapping});
    }

    defaultOpt(opt, displaySecured) {
        let option = super.defaultOpt(opt, displaySecured);
        return option;
    }
}


const model = new TokenBlackListModel();
module.exports = model;
