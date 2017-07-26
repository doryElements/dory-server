// Logger
const logger = require('../logger');

const express = require('express');
const router = express.Router();
// const User = require('../models/users');

router.get('/',  (req, res, next) => {
    // console.log('req keys', Object.keys(req));
    // console.log('req authInfo',req.authInfo);
    res.json({message: 'ok', user: req.user, jwt: req.authInfo});
});



module.exports = router;
