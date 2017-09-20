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
// Validator Keyword
// ajv.addKeyword('emailExists', {
//     async: true,
//     type: 'string',
//     validate: checkIdExists
// });

// Schema validator
const schema = {
    "$id": "userSchema.json#",
    "$async": true,
    "properties": {
        "name": {"type": "string", "minLength": 2},
        "email": {"type": "string", "format": "email", "checkFieldNotExists": {field: 'email'}}
    }
};


class UserModel extends ElasticModel {

    constructor() {
        super({indexName, indexType, mapping, schema});
    }

    defaultOpt(opt, displaySecured) {
        let option = super.defaultOpt(opt, displaySecured);
        if (!displaySecured) {
            option = Object.assign(option, {_source_exclude: 'secured'})
        }
        return option;
    }

    registerValidators(ajv) {
        ajv.addKeyword('checkFieldNotExists', {
            async: true,
            type: 'string',
            validate: this.checkFieldNotExists.bind(this)
        });
        return ajv;
    }

    adaptSearchResponse(result, size, from) {
        const hits = result.hits;
        const response = {
            total: hits.total,
            size: size,
            from: from,
            hits: hits.hits.map(line => this.adaptResponse(line))
        };
        return response;
    }

    checkFieldNotExists(schema, data, rules, field, model) {
        const querySearchField = {
            'body': {
                'query': {
                    'constant_score': {
                        'filter': {
                            'bool': {
                                'should': {'term': {[schema.field]: data}},
                                "must_not": {'term': {'_id': model.id}}
                            }
                        }
                    }
                }
            }
        };
        const request = this.defaultOpt(querySearchField, false);
        return this.client.search(request).then(response => {
            const total = response.hits.total;
            return !total;
        });
    }

    getByEmail({email, secured}) {
        const querySearchEmail = {
            'body': {
                'query': {
                    'constant_score': {
                        'filter': {
                            'term': {'email': email}
                        }
                    }
                }
            }
        };
        const request = this.defaultOpt(querySearchEmail, secured);
        return this.client.search(request)
            .then(this.validateOne.bind(this));
    }

    searchUserByText(searchText = '', size = 10, from = 0) {
        const request = this.defaultOpt({
            body: {
                'size': size,
                'from': from,
                'query': {
                    'simple_query_string': {
                        'query': `${searchText}*`
                    }
                }
            }
        });

        return this.client.search(request)
            .then(result => this.adaptSearchResponse(result, size, from));
    }

    validatePassword(cypherPassword, password) {
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
            .then(isSame => isSame);
    }

    changePassword(id, plaintextPassword) {
        return this.hashPasswordPromise(plaintextPassword).then(hashPassword => {
            const request = {
                id,
                body: {
                    doc: {
                        secured: {
                            password: hashPassword
                        }
                    }
                }
            };
            return this.client.update(this.defaultOpt(request, true))
        }).then(this.adaptResponse);
    }

    // FIXME blacklist token
    logout() {

    }

}

const model = new UserModel();


module.exports = model;

