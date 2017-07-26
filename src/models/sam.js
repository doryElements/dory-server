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

    getByParams(searchText,searchFields){
        console.log('Search for  : ',searchText, searchFields);
        // const request =this.defaultOpt({q: 'app:'+searchText});
        const request =this.defaultOpt({
            body:{
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
