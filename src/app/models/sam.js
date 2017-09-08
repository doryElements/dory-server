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

    adaptBody(body) {
        body.app  = body.app.toUpperCase();

        if(body.production){
            body.production.serveursDmz = body.production.serveursDmz.map(function(s){return s.toUpperCase()});
            body.production.serveursLan = body.production.serveursLan.map(function(s){return s.toUpperCase()});
            body.production.bdds = body.production.bdds.map(function(s){return s.toUpperCase()});
        }
        if(body.recette){
            body.recette.serveursDmz = body.recette.serveursDmz.map(function(s){return s.toUpperCase()});
            body.recette.serveursLan = body.recette.serveursLan.map(function(s){return s.toUpperCase()});
            body.recette.bdds = body.recette.bdds.map(function(s){return s.toUpperCase()});
        }
        if(body.qualif){
            body.qualif.serveursDmz = body.qualif.serveursDmz.map(function(s){return s.toUpperCase()});
            body.qualif.serveursLan = body.qualif.serveursLan.map(function(s){return s.toUpperCase()});
            body.qualif.bdds = body.qualif.bdds.map(function(s){return s.toUpperCase()});
        }
        return body;
    }

    appExists(app) {
        return this.getByParams(app)
            .then(result =>{
                let res = false;
                result.hits.forEach(function(e){
                    if(app === e.app){
                        res = true;
                    }
                });
                return res;
            });
    }

    getByName(name) {
        let res = '';
        return this.getByParams(name)
            .then(result => {
                result.hits.forEach(hit => {
                    if(hit.app === name){
                        res =  hit;
                    }
                });
                return res;
            })
    }

    getByParams(searchText = '', size = 10, from = 0) {
        //Workaround to escape special characters
        //Need to be adapted to work when there are several - (or other special characters)
        if(searchText.includes('-')){
            let split = searchText.split('-');
            searchText = `${split[0]} \- ${split[1]}`;
            logger.debug('search',searchText);
        }
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

    getNames() {
        const request = this.defaultOpt({
            body: {
                'size':1000,
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
                let names = [];
                response.hits.forEach(function(app){
                    names.push(app.app);
                });
                return names.sort();
            });
    }

    // TODO : Complete
    // getRelatives(id,visited=[]) {
    //     const app = this.getById({id:id});
    //     let links = [];
    //     let nodes = [];
    //
    //     if(app.relatives){
    //         app.relatives.forEach(function(rel){
    //             if(!visited.includes(rel)){
    //                 nodes.push({'name':rel,'color':'#FFCC80','icon':'tab'});
    //                 links.push({'source':app.app,'target':rel});
    //                 let relId = this.getByParams(rel);
    //                 let next = this.getRelatives(relId);
    //                 nodes.push(next.nodes);
    //                 links.push(next.nodes);
    //                 visited.push(rel);
    //             }
    //         });
    //     }
    //
    //     return {links:links,nodes:nodes};
    // }

    getRelatives(id,nodes=[],links=[], visited=[]){
       return this.getById({id:id}).then(app => {
            return {relatives:app.relatives,app:app.app};
        }).then(({relatives,app}) => {
            return relatives.map( rel => {
                if (!visited.includes(rel)) {
                    nodes.push(rel);
                    links.push({source:app,target:rel});
                    visited.push(rel);
                    return this.getByName(rel);
                }
                links.push({source:app,target:rel});
                return undefined;
            })
        }).then(promises => Promise.all(promises)).then(relApps=> {
            return relApps.map(relApp=> {
                if (relApp) {
                    return this.getRelatives(relApp.id,nodes,links, visited);
                }
            })
        }).then(promises => Promise.all(promises)).then(results => {
            if (results && results.length>0) {
               // Array.prototype.push.apply(nodes,results);
            }
            return {nodes:nodes,links:links};
       });
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
                return dbs.sort(function(a,b) {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                });
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


                return {
                    serversLan: LAN.sort(function(a,b) {
                        return a.toLowerCase().localeCompare(b.toLowerCase());
                    }),
                    serversDmz: DMZ.sort(function(a,b) {
                        return a.toLowerCase().localeCompare(b.toLowerCase());
                    })
                };
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
