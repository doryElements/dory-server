var express = require('express');
var router = express.Router();

const Sam = require('../models/sams');

router.get('/',  (req, res, next) => {
    const id = '1';
    Sam.getById({id}).then(result=> {
        res.json(result);
    });
    res.json({message: 'ok', user: req.user, jwt: req.authInfo});
});


module.exports = router;
