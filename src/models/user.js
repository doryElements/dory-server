// Logger
const logger = require('../logger');

const indexName = 'users';
const indexType = 'user';

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
            },
            email: {type: "string", index: "not_analyzed"},
            secured: {
                properties: {
                    password: {
                        type: "string",
                        index: "not_analyzed"
                    },
                }
            }
        }
    }
};

const dao = require('./elasticDAO')({index: indexName, mapping});
const client = require('./elasticClient');


const users = [{
    id: 1,
    name: "John",
    email: "john@mail.com",
    secured: {
        password: "john123"
    }
}, {
    id: 2,
    name: "Sarah",
    email: "sarah@mail.com",
    secured: {
        password: "sarah123"
    }

}];



const defaultOpt = function (opt, secured) {
    opt.index = indexName;
    opt.type=indexType;
    if (!secured) {
        opt._sourceExclude = 'secured';
    }
    return opt;
};

const adaptModel = dao.adaptModel;
const validateOne = dao.validateOne;
const manageError = dao.manageError;

const getById = function ({id, secured}) {
    return client.get(defaultOpt({id, secured})).then(adaptModel).catch(manageError);
};
const getByEmail = function ({email, secured}) {
    const request =defaultOpt({q: 'email:'+email}, secured);
    return client.search(request).then(validateOne).catch(manageError);
};

const addUser = function (user) {
    const id = user.id;
    delete user.id;
    return client.index({
        index: indexName,
        type: indexType,
        id: id,
        body: user
    });
};

const validePassword= function (cypherPassword, password)  {
    return cypherPassword === password;
};

exports.users = users;
exports.getById = getById;
exports.getByEmail = getByEmail;
exports.validePassword = validePassword;
exports.addUser = addUser;
exports.initIndexUser = dao.createIndexMappingIndex;
