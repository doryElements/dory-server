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
    opt.type = indexType;
    return opt;
};

const adaptModel = dao.adaptModel;
const adaptResponse = dao.adaptResponse;
const validateOne = dao.validateOne;
const manageError = dao.manageError;


/**
 * { _index: 'sams', _type: 'sam',
     _id: 'AV11nbwe336X_EgSYDNk',  _version: 3,
     found: true,
     _source: { name: 'Oura' }
   }
 * @param id
 * @param version
 * @param secured
 * @returns {Promise.<TResult>}
 */
const getById = function ({id, version, secured}) {
    return client.get(defaultOpt({id, version}, secured))
        .then(result => {
            console.log('Result', result);
            return result;
        }).then(adaptResponse);
};
/**
 * create Sam result :
 * { _index: 'sams',
  _type: 'sam',
  _id: 'AV11nbwe336X_EgSYDNk',
  _version: 1,
  result: 'created',
  _shards: { total: 2, successful: 1, failed: 0 },
  created: true }
 * @param sam
 * @returns {Promise.<TResult>}
 */
const createSam = function (sam) {
    console.log('create Sam : ', sam);
    const id = sam.id;
    delete sam.id;
    return client.index({
        index: indexName, type: indexType,
        body: sam
    }).then(adaptResponse);
};

/**
 * update result :  { _index: 'sams',
  _type: 'sam',
  _id: 'AV11nbwe336X_EgSYDNk',
  _version: 2,
  result: 'updated',
  _shards: { total: 2, successful: 1, failed: 0 },
  created: false }
 *
 * @param sam
 * @param id
 * @param version
 * @returns {Promise.<TResult>}
 */
const updateSam = function (sam, id, version) {
    return client.index({
        index: indexName, type: indexType,
        id: id,  version: version,
        body: sam
    }).then(adaptResponse);
};

const deleteSam = function (id, version) {
    return client.delete({
        index: indexName, type: indexType,
        id: id, version: version
    }).then(adaptResponse);
};

exports.getById = getById;
exports.updateSam = updateSam;
exports.createSam = createSam;
exports.deleteSam = deleteSam;
