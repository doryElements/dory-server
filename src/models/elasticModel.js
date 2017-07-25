const logger = require('../logger');
const client = require('./elasticClient');


class ElasticModel {

    constructor({indexName, indexType, mapping}) {
        super.constructor();
        this.index = indexName;
        this.indexType = indexType;
        this.mapping = mapping;
    }

    indexExists() {
        return client.indices.exists({
            index: this.index
        });
    }

    deleteIndex() {
        return client.indices.delete({
            index: this.index
        });
    }

    initIndex() {
        return client.indices.create({
            index: this.index
        });
    }

    initMapping() {
        return client.indices.putMapping(this.mapping);
    }

    createIndexMappingIndex() {
        return this.indexExists().then(function (exists) {
            if (exists) {
                return this.deleteIndex();
            }
            return exists;
        }).then(this.initIndex).then(this.initMapping);
    }

    defaultOpt(opt, secured) {
        opt.index = this.index;
        opt.type = this.indexType;
        return opt;
    };

    foo() {
        logger.info('Log Foo');
    }

}

module.exports = ElasticModel;