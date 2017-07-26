// Logger
const logger = require('../logger');
const ElasticModel = require('./elasticModel');
const client = require('./elasticClient');
const Ajv = require('ajv');

const indexName = 'sam';
const indexType = 'sam';

const mapping = {
    index: indexName,
    type: indexType,
    body: {
        properties: {
            name: {
                type: "text",
                fields: {
                    untouched: {
                        type: "text",
                        index: "not_analyzed"
                    }
                }
            }
        }
    }
};

const schema = {
    "$id": "samSchema.json#",
    "$async": true,
    "properties": {
        "name": {"type": "string", "minLength": 2}
    }
};


class SamModel extends ElasticModel {

    constructor() {
        super({indexName, indexType, mapping, schema});
    }

    getByParams(searchText, searchFields) {
        const request = this.defaultOpt({
            body: {
                'query': {
                    'simple_query_string': {
                        'fields': searchFields,
                        'query': `${searchText}*`
                    }
                }
            }
        });

        return client.search(request);
    }

}

const model = new SamModel();

model.validate({name: '1', postId: 19})
    .then(function (data) {
        logger.info('Data is valid', data); // { userId: 1, postId: 19 }
    }).catch(function (err) {
    if (!(err instanceof Ajv.ValidationError)) throw err;
    // data is invalid
    logger.info('Validation errors:', err.errors);
});

module.exports = model;
