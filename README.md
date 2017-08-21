# Dory Server

Koa Implementation

# Run dev 

```shall
npm run dev
```

```
curl -H "Content-Type: application/json" -X POST -d '{"email":"john@mail.com","password": "john123"}'  http://localhost:8181/token
```

# TODO
## TODO Server 

1. Intégration du projet dory-app dans dory-server (ficier html de l'IHM dans le projet bower, ajout d'un répertoire static servi par express)
1. Implémentation de toutes les règles de validations des entité SAM
1. Mise en place de la sécurtité d'accès par Rôle (role positionné dans le token)
1. Test Unitaire sur les implementations serveurs (validation, logique métier, sécurité...)
1. Chiffrage des password avec bcryptjs
1. Implémentation Cache Http: Implementation des etag /IF-Non-Match / et code retour 304 Not Modified sans body

## DONE Server
Déplacer les taches faites dans ce menu
1. Mécanisme de validation des JSON avec convertion du format d'erreur 422 
1. Mise en place de HTTP/2
1. Renvoyer le token JWT dans un cookie (en service middleware, impact sur auth.js qui récupère le token)

## IHM
1. Mise en place des écrans de logins
1. IntégrerMise en place d'un custom style https://www.polymer-project.org/2.0/docs/devguide/style-shadow-dom#custom-style
1. Travailler sur les le coté jolie de l'IHM d'édition
1. Ajouter la navigation clavier sur l'écran de recherche dory
1. Ajouter la gestion d'url sur la navigation: début de composant https://github.com/FiveElements/earth-crud-pages (https://github.com/PolymerElements/app-route/issues/205

## DONE IHM
Déplacer les taches faites dans ce menu
1. Pointer les service REST sur le Server nodejs dory-server
1. Intégrer earth-cruddy pour gérer la persistence  https://github.com/FiveElements/earth-cruddy
1. Integration de dory-sam dans le projet dory-app (pour utiliser les patterns PRPL)
1. Création de nouveaux écrans pour afficher la liste des serveurs et des bases de données

## Documentation

## Koa
* sample: https://github.com/koajs/examples
* Middleware List : https://github.com/koajs/koa/wiki

## Options
* Recherche de librairie nodejs : https://www.npmjs.com/
* Tuto JWT express:  https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens


* Passport : http://passportjs.org/
* Passport JWT : https://blog.jscrambler.com/implementing-jwt-using-passport/
 
* Sample ES : https://blog.raananweber.com/2015/11/24/simple-autocomplete-with-elasticsearch-and-node-js/
 
## Logging File
* https://www.loggly.com/ultimate-guide/node-logging-basics/


# Elasticsearch

* Resilience : https://www.elastic.co/guide/en/elasticsearch/resiliency/current/index.html

# Http/2
## Create certificats
```bash
$ openssl genrsa -des3 -passout pass:x -out server.pass.key 2048
==>  server.pass.key

$ openssl rsa -passin pass:x -in server.pass.key -out server.key
==> server.key

$ rm server.pass.key

$  openssl req -new -key server.key -out server.csr
==>  server.csr

$ openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt
==> server.crt
```
* https://github.com/expressjs/express/issues/2364