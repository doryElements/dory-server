// Logger
const logger = require('../logger');
const ElasticModel = require('./elasticModel');
const bcrypt = require('bcryptjs');



// Config
const saltRounds = 13;
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

const schema = {
    "$id": "userSchema.json#",
    "$async": true,
    "properties": {
        "name": {"type": "string", "minLength": 2},
        "email": {"type": "string", "format": "email"}
    }
};


class UserModel extends ElasticModel {

    constructor() {
        super({indexName, indexType, mapping, schema});
    }

    getByEmail({email, secured}) {
        const request =this.defaultOpt({q: 'email:'+email}, secured);
        return this.client.search(request)
            .then(this.validateOne.bind(this));
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
    // FIXME blacklist token
    logout(){

    }

}
const model = new UserModel();



module.exports=model;

