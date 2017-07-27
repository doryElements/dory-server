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
const client = require('./elasticClient');


class SamModel extends ElasticModel {

    constructor() {
        super({indexName, indexType, mapping});
    }

    getByParams(searchText='',searchFields=['app','tags'], size=10, from=0){
        const request =this.defaultOpt({
            body:{
                'size' : size,
                'from' : from,
                'query': {
                    'simple_query_string':{
                        'fields': searchFields ,
                        'query': `${searchText}*`
                    }
                }
            }
        });

        return client.search(request);
    }

}

const model = new SamModel();

module.exports=model;
