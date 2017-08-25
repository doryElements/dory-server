// Logger
const logger = require('../logger');
const ElasticModel = require('./elasticModel');
const client = require('./elasticClient');
const Ajv = require('ajv');


const indexName = 'sam';
const indexType = 'sam';

const mapping = {
    index: indexName,
    type: indexType,
    body: {
        properties: {
            app: {
                type: "string",
                fields: {
                    untouched: {
                        type: "string",
                        index: "not_analyzed"
                    }
                }
            }
        }
    }
};

const schema = {
    "$id": "samSchema.json#",
    "$async": true,
    "properties": {
        "app": {"type": "string", "minLength": 2}
    }
};


class SamModel extends ElasticModel {

    constructor() {
        super({indexName, indexType, mapping, schema});
    }
    adaptSearchResponse(result,size, from) {
        const hits = result.hits;
        const response = {
            total: hits.total,
            size:size,
            from:from,
            hits: hits.hits.map(line => this.adaptResponse(line))
        };
        return response;
    }

    getByParams(searchText = '', size = 10, from = 0) {
        const request = this.defaultOpt({
            body: {
                'size': size,
                'from': from,
                'query': {
                    'simple_query_string': {
                        'query': `${searchText}*`
                    }
                },
                'sort' : [
                    {'app.untouched':{'order':'asc'}}
                ]
            }
        });

        return client.search(request)
            .then(result => this.adaptSearchResponse(result,size, from));
    }

    getDatabases() {
        const request = this.defaultOpt({
           body: {
               'size': 1000,
               'query': {
                   'match_all': {}
               }
           }
        });
        return client.search(request)
            .then(result => {
                const hits = result.hits;
                const response = {
                    total: hits.total,
                    hits: hits.hits.map(line => this.adaptResponse(line))
                };
                let dbs = [];
                response.hits.forEach(function(app) {
                    if(app.production && app.production.bdds){
                        app.production.bdds.forEach(function(bdd){
                            if(!dbs.includes(bdd)){
                                dbs.push(bdd);
                            }
                        });
                    }
                    if(app.qualif && app.qualif.bdds) {
                        app.qualif.bdds.forEach(function (bdd) {
                            if (!dbs.includes(bdd)) {
                                dbs.push(bdd);
                            }
                        });
                    }
                    if(app.recette && app.recette.bdds) {
                        app.recette.bdds.forEach(function (bdd) {
                            if (!dbs.includes(bdd)) {
                                dbs.push(bdd);
                            }
                        });
                    }
                });
                return dbs.sort();
            });
    }

    getServers() {
        const request = this.defaultOpt({
            body: {
                'size': 1000,
                'query': {
                    'match_all': {}
                }
            }
        });
        return client.search(request)
            .then(result => {
                const hits = result.hits;
                const response = {
                    total: hits.total,
                    hits: hits.hits.map(line => this.adaptResponse(line))
                };
                let LAN = [];
                let DMZ = [];

                response.hits.forEach(function(app) {
                    if(app.production ){
                        if(app.production.serveursLan){
                            app.production.serveursLan.forEach(function(server){
                                if(!LAN.includes(server)){
                                    LAN.push(server);
                                }
                            });
                        }
                        if(app.production.serveursDmz){
                            app.production.serveursDmz.forEach(function(server){
                                if(!DMZ.includes(server)){
                                    DMZ.push(server);
                                }
                            });
                        }
                    }
                    if(app.recette){
                        if(app.recette.serveursLan){
                            app.recette.serveursLan.forEach(function(server){
                                if(!LAN.includes(server)){
                                    LAN.push(server);
                                }
                            });
                        }
                        if(app.recette.serveursDmz){
                            app.recette.serveursDmz.forEach(function(server){
                                if(!DMZ.includes(server)){
                                    DMZ.push(server);
                                }
                            });
                        }
                    }
                    if(app.qualif){
                        if(app.qualif.serveursLan){
                            app.qualif.serveursLan.forEach(function(server){
                                if(!LAN.includes(server)){
                                    LAN.push(server);
                                }
                            });
                        }
                        if(app.qualif.serveursDmz){
                            app.qualif.serveursDmz.forEach(function(server){
                                if(!DMZ.includes(server)){
                                    DMZ.push(server);
                                }
                            });
                        }
                    }
                });


                return {serversLan: LAN.sort(), serversDmz: DMZ.sort()};
            });
    }

}

const model = new SamModel();




// model.validate({name: '1', postId: 19})
//     .then(function (data) {
//         logger.info('Data is valid', data); // { userId: 1, postId: 19 }
//     })
//     .catch(function (err) {
//         logger.error(err.errors);
//     });

module.exports = model;
