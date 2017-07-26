const client = require('./elasticClient');


module.exports = function({index, mapping}) {
    const indexExists = function () {
        return client.indices.exists({
            index
        });
    };
    function deleteIndex() {
        return client.indices.delete({
            index
        });
    };
    const initIndex = function () {
        return client.indices.create({
            index
        });
    };
    const initMapping = function () {
        return client.indices.putMapping(mapping);
    };

    const createIndexMappingIndex = function () {
        return indexExists().then(function (exists) {
            if (exists) {
                return deleteIndex();
            }
            return exists;
        }).then(initIndex).then(initMapping);
    };

    const adaptModel = function (result) {
        const user = result._source;
        user.id = result._id;
        user.version = result._version;
        return user;
    };

    const adaptResponse = function (result) {
        let response = {
            id: result._id,
            version: result._version
        };
        if (result._source) {
            response = Object.assign(response, result._source);
        }
        if (result.created) {
            response.created= result.created;
        }
        console.log('---> Response', result);
        return response;
    };


    const validateOne = function (response) {
        const result = response.hits;
        console.log(result);
        if (result.total === 1) {
            return adaptModel(result.hits[0]);
        } else {
            return Promise.reject(new Error("Too much result"));
        }
        return result;
    };


    const manageError = function (err) {
        const error = new Error(err.message);
        error.status = err.status;
        console.error('err:', err);
        throw  error;
    };


    return {
        client,
        indexExists,
        createIndexMappingIndex,
        adaptResponse, adaptModel,validateOne,
        manageError
    };
};