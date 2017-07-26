// Logger
const logger = require('../logger');

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

const ElasticModel = require('./elasticModel');


class SamModel extends ElasticModel {

    constructor() {
        super({indexName, indexType, mapping});
    }

}

const model = new SamModel();
// model.foo();

module.exports=model;
