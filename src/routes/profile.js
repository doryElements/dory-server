var express = require('express');
var router = express.Router();
// const User = require('../models/users');

router.get('/',  (req, res, next) => {
    // console.log('req keys', Object.keys(req));
    // console.log('req authInfo',req.authInfo);
    res.json({message: 'ok', user: req.user, jwt: req.authInfo});
});


module.exports = router;
