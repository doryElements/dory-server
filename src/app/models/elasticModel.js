const logger = require('../logger');
const client = require('./elasticClient');
//Validator
// const setupAsync = require('ajv-async');
const localize = require('ajv-i18n');
const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true, jsonPointers: false}); // options can be passed, e.g. {allErrors: true}

const ValidationError = require('../errors/validationError');


/**
 * {
 *   "errors" :
 *   {
 *       "arg1" : ["error msg 1", "error msg 2", ...]
 *       "arg2" : ["error msg 1", "error msg 2", ...]
 *   }
 * }
 */
function manageAjvValidationError(err) {
    if (!(err instanceof Ajv.ValidationError)) throw err;
    throw   (ValidationError.convertAjvValidationError(err));
}


class ElasticModel {

    constructor({indexName, indexType, mapping, schema}) {
        super.constructor();
        this.client = client;
        this.index = indexName;
        this.indexType = indexType;
        this.mapping = mapping;
        if (schema) {
            if (!schema.$async) {
                schema.$async = true;
            }
            this.validator = ajv.compile(schema);
        }
    }

    validate(data) {
        // logger.debug('request validate', data);
        if (this.validator) {
            return this.validator(data).catch(manageAjvValidationError);
        } else {
            return new Promise(resolve => {
                resolve(data);
            })
        }
    }

    indexExists() {
        return client.indices.exists({index: this.index});
    }

    deleteIndex() {
        return client.indices.delete({index: this.index});
    }

    initIndex() {
        return client.indices.create({index: this.index}).catch(error => {
            logger.error(error);
        });
    }

    initMapping(opt) {
        // logger.debug('initMapping', this.mapping);
        return client.indices.putMapping(this.mapping);
    }

    createIndexMappingIndex() {
        return this.indexExists().then((exists) => {
            // logger.debug('indexExists', exists);
            if (exists) {
                return this.deleteIndex();
            }
            return exists;
        }).then(this.initIndex.bind(this)).then(this.initMapping.bind(this));
    }

    defaultOpt(opt, secured) {
        const option = Object.assign({
            index: this.index,
            type: this.indexType
        }, opt);
        // logger.debug('-------- defaultOpt', option);
        return option;
    }

    adaptResponse(result) {
        // logger.debug("----- adaptResponse", result);
        const source = result._source;
        let response = {_score:result._score, id: result._id, version: result._version,  };
        if (source) {
            response = Object.assign({}, response, source);
        }
        if (result.created) {
            response.created = result.created;
        }
        // logger.debug("----- adaptResponse", response);
        return response;
    }

    validateOne(response) {
        const result = response.hits;
        // logger.debug("validateOne", result);
        if (result.total === 1) {
            return this.adaptResponse(result.hits[0]);
        } else {
            return Promise.reject(new Error("Too much result"));
        }
    }


    getById({id, version, secured}) {
        return client.get(this.defaultOpt({id, version}, secured))
            .then(response => this.adaptResponse(response));
    }

    create(data) {
        logger.debug('create model :', data);
        const id = data.id;
        const version = data.version;
        const model = Object.assign({}, data);
        delete model.id;
        delete model.version;
        return this.validate(model)
            .then(body => { // Prepare request
                let request = id ? Object.assign({body}, {id}) : {body};
                request = version ? Object.assign({request}, {version}) : request;
                return request;
            }).then(request => client.index(this.defaultOpt(request, true)))
            .then(this.adaptResponse);
    }

    update(data, id, version) {
        return this.validate(data)
            .then(body => client.index(this.defaultOpt({id, version, body}, true)))
            .then(this.adaptResponse);
    }

    delete(id, version) {
        return client.delete(this.defaultOpt({id, version}, true))
            .then(this.adaptResponse);
    }

}

module.exports = ElasticModel;