const logger = require('../logger');
const client = require('./elasticClient');
//Validator
// const setupAsync = require('ajv-async');
var localize = require('ajv-i18n');
const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true, jsonPointers:false}); // options can be passed, e.g. {allErrors: true}

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
    // data is invalid
    // 422
    logger.info('Validation errors:', err.errors);

    localize.fr(err.errors); // TODO // Use the language request
    const errors = err.errors;
    const errorMapping = errors.reduce((acc, error) => {
        // Error Key
        const key = error.dataPath.slice(1);
        let values = acc[key];
        if (!values) {
            values = [];
            acc[key] = values;
        }
        // Error Value
        const clone = Object.assign({}, error);
        delete clone.dataPath;
        delete clone.schemaPath;
        values.push(clone);
        return acc;
    }, {});
    // logger.info('Validation errors:', errorMapping);
    throw new ValidationError(err.message, errorMapping);
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
                schema.$async =true;
            }
            this.validator = ajv.compile(schema);
        }
    }

    validate(data) {
        logger.debug('request validate', data);
        if (this.validator) {
            return this.validator(data).catch(manageAjvValidationError);
        } else {
            return new Promise(resolve=>{
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
        let response = {id: result._id, version: result._version};
        if (source) {
            response = Object.assign(response, source);
        }
        if (result.created) {
            response.created = result.created;
        }
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
        return result;
    }


    getById({id, version, secured}) {
        return client.get(this.defaultOpt({id, version}, secured))
            .then(this.adaptResponse);
    }

    create(data) {
        const id = data.id;
        const version = data.version;
        const body = Object.assign({}, data);
        let request = {body};
        if (id) {
            delete body.id;
            request = Object.assign(request, {id});
        }
        if (version) {
            delete body.version;
            request = Object.assign(request, {version});
        }
        return client.index(this.defaultOpt(request))
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


}

module.exports = ElasticModel;