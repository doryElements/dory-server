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
        return client.indices.exists({index: this.index});
    }

    deleteIndex() {
        return client.indices.delete({index: this.index});
    }

    initIndex() {
        return client.indices.create({index: this.index});
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
        return Object.assign({
            index: this.index,
            type: this.indexType
        }, opt);
        return opt;
    };

    adaptResponse(result) {
        const source = result._source;
        return Object.assign({
            id: result._id,
            version: result._version
        }, source);
    };

    getById({id, version, secured}) {
        return client.get(this.defaultOpt({id, version}, secured))
            .then(this.adaptResponse);
    }

    create(data) {
        const id = data.id;
        const body = Object.assign({}, data);
        delete body.id;
        delete body.version;
        return client.create(this.defaultOpt({body, id}, secured))
            .then(this.adaptResponse);
    };

    delete(id, version) {
        return client.delete(this.defaultOpt({id, version}))
            .then(this.adaptResponse);
    };

    update(body, id, version) {
        return client.index(this.defaultOpt({id, version, body}))
            .then(this.adaptResponse);
    };

    foo() {
        logger.info('Log Foo');
    }

}

module.exports = ElasticModel;