// Logger
const logger = require('../logger');

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const userData = require('../userData').users;

router.get('/',  (req, res, next) => {
    // console.log('req keys', Object.keys(req));
    // console.log('req authInfo',req.authInfo);
    res.json({message: 'ok', user: req.user, jwt: req.authInfo});
});

router.get('/init', (req, res) => {
    User.createIndexMappingIndex()
        .then(result => {
            logger.debug('createIndexMappingIndex', result);
            return result;
        } )
        .then(result =>   userData.map(user =>  User.create(user) ) )
        .then(promises => Promise.all(promises))
        .then(results => res.json(results))
        .catch(err => res.status(500).json(err));
});

router.put('/:id/password', (req, res) => {
    const password = 'coucou';
    User.hashPasswordPromise(password).then(hash=> {
        res.json({message: 'TODO change password', password, hash});
        return hash;
    });
});

module.exports = router;
