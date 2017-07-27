# Dory Server

# Run dev 

```shall
npm run dev
```

```
curl -H "Content-Type: application/json" -X POST -d '{"email":"john@mail.com","password": "john123"}'  http://localhost:8181/token
```

# TODO
## TODO Server 
1. Renvoyer le token JWT dans un cookie (en service middleware, impact sur auth.js qui récupère le token)
1. Intégration du projet dory-app dans dory-server (ficier html de l'IHM dans le projet bower, ajout d'un répertoire static servi par express)
1. Mis en place des controles server pour valider le JSON sur les opération de CRUD
1. Mise en place de la sécurtité d'accès par Rôle (role positionné dans le token)
1. Chiffrage des password avec bcryptjs
1. Mise en place de HTTP/2

## DONE Server
Déplacer les taches faites dans ce menu

## IHM
1. Integration de dory-sam dans le projet dory-app (pour utiliser les patterns PRPL)
1. Mise en place des écrans de logins
1. Pointer les service REST sur le Server nodejs dory-server
1. Intégrer earth-cruddy pour gérer la persistence  https://github.com/FiveElements/earth-cruddy
1. IntégrerMise en place d'un custom style https://www.polymer-project.org/2.0/docs/devguide/style-shadow-dom#custom-style
1. Travailler sur les le coté jolie de l'IHM d'édition
1. Ajouter la navigation clavier sur l'écran de recherche dory
1. Ajouter la gestion d'url sur la navigation: début de composant https://github.com/FiveElements/earth-crud-pages (https://github.com/PolymerElements/app-route/issues/205

## DONE IHM
Déplacer les taches faites dans ce menu

## Documentation

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
* https://github.com/expressjs/express/issues/2364