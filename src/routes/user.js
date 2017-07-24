var express = require('express');
var router = express.Router();
const User = require('../models/user');

router.get('/',  (req, res, next) => {
    // console.log('req keys', Object.keys(req));
    // console.log('req authInfo',req.authInfo);
    res.json({message: 'ok', user: req.user, jwt: req.authInfo});
});

router.get('/init', (req, res) => {
    User.initIndexUser()
        .then(result =>   User.users.map(user =>  User.addUser(user) ) )
        .then(promises => Promise.all(promises))
        .then(results => res.json(results))
        .catch(err => res.status(500).json(err));
});



module.exports = router;
