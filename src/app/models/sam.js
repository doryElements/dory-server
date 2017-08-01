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
    adaptSearchResponse(result,size, from) {
        const hits = result.hits;
        const response = {
            total: hits.total,
            size:size,
            from:from,
            hits: hits.hits.map(line => this.adaptResponse(line))
        };
        return response;
    }

    getByParams(searchText = '', searchFields = ['app', 'tags'], size = 10, from = 0) {
        const request = this.defaultOpt({
            body: {
                'size': size,
                'from': from,
                'query': {
                    'simple_query_string': {
                        'fields': searchFields,
                        'query': `${searchText}*`
                    }
                }
            }
        });

        return client.search(request)
            .then(result => this.adaptSearchResponse(result,size, from));
    }

}

const model = new SamModel();




// model.validate({name: '1', postId: 19})
//     .then(function (data) {
//         logger.info('Data is valid', data); // { userId: 1, postId: 19 }
//     })
//     .catch(function (err) {
//         logger.error(err.errors);
//     });

module.exports = model;
