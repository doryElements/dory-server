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
const ElasticModel = require('./elasticModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;


class UserModel extends ElasticModel {

    constructor() {
        super({indexName, indexType, mapping});
    }

    getByEmail({email, secured}) {
        const request =this.defaultOpt({q: 'email:'+email}, secured);
        return client.search(request).then(this.validateOne);
    }


    validatePassword(cypherPassword, password)  {
        return cypherPassword === password;
    }

    hashPassword(plaintextPassword) {
        return bcrypt.hashSync(plaintextPassword, saltRounds);
    }
    comparePassword(plaintextPassword, hash) {
        return bcrypt.compareSync(plaintextPassword, hash);
    }

    hashPasswordPromise(plaintextPassword) {
        return bcrypt.hash(plaintextPassword, saltRounds)
            .then(hash => hash);
    }
    comparePasswordPromise(plaintextPassword, hash) {
        return bcrypt.compare(plaintextPassword, hash)
            .then( isSame => isSame);
    }

}
const model = new UserModel();
// model.getByEmail({email:'sarah@mail.com'}).then(result=> {
//     logger.info('-----------------------', result);
// })

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


module.exports=model;
// exports.users = users;
// exports.getById = getById;
// exports.getByEmail = getByEmail;
// exports.validePassword = validePassword;
// exports.addUser = addUser;
// exports.initIndexUser = dao.createIndexMappingIndex;
