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
        const option =  Object.assign({
            index: this.index,
            type: this.indexType
        }, opt);
        logger.debug('-------- defaultOpt', option);
        return option;
    }

    adaptResponse(result) {
        const source = result._source;
        let response = {id: result._id,  version: result._version};
        if (source) {
            response = Object.assign(response, source);
        }
        if (result.created) {
            response.created= result.created;
        }
        return response;
    }

    validateOne (response) {
        const result = response.hits;
        logger.debug("validateOne", result);
        if (result.total === 1) {
            return this.adaptResponse(result.hits[0]);
        } else {
            return Promise.reject(new Error("Too much result"));
        }
        return result;
    }


    getById({id, version, secured}) {
        return client.get(this.defaultOpt({id, version}, secured))
            .then(this.adaptResponse);
    }

    create(data) {
        const id = data.id;
        const body = Object.assign({}, data);
        delete body.id;
        delete body.version;
        return client.index(this.defaultOpt({body}))
            .then(this.adaptResponse);
    }

    delete(id, version) {
        return client.delete(this.defaultOpt({id, version}))
            .then(this.adaptResponse);
    }

    update(body, id, version) {
        return client.index(this.defaultOpt({id, version, body}))
            .then(this.adaptResponse);
    }

    foo() {
        logger.info('Log Foo');
    }

}

module.exports = ElasticModel;