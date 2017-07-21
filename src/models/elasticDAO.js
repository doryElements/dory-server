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

    const validateOne = function (response) {
        const result = response.hits;
        console.log(result);
        if (result.total === 1) {
            return adaptModel(result.hits[0]);
        } else {
            return Promise.reject(new Error("Too much result"))
        }
        return result;
    };


    const manageError = function (err) {
        console.log('err:', err);
    };


    return {
        client,
        indexExists,
        createIndexMappingIndex,
        adaptModel,validateOne,
        manageError
    }
};