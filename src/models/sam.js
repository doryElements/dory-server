const indexName = 'sams';
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

const dao = require('./elasticDAO')({index: indexName, mapping});
const client = require('./elasticClient');



const defaultOpt = function (opt, secured) {
    opt.index = indexName;
    opt.type=indexType;
    return opt;
};

const adaptModel = dao.adaptModel;
const validateOne = dao.validateOne;
const manageError = dao.manageError;

const getById = function ({id, secured}) {
    return client.get(defaultOpt({id, secured})).then(adaptModel).catch(manageError);
}

const createSam = function (sam) {
    const id = sam.id;
    delete sam.id;
    return client.index({
        index: indexName,
        type: indexType,
        id: id,
        body: sam
    });
};

const deleteSam = function (id, version) {
    return client.delete({
        index: indexName,
        type: indexType,
        id: id,
        version: version
    });
};

exports.getById = getById;
exports.createSam = createSam;
exports.deleteSam = deleteSam;
