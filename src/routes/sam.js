var express = require('express');
var router = express.Router();

const Sam = require('../models/sams');

router.get('/:id',  (req, res, next) => {
    const id= req.params.id;
    Sam.getById({id}).then(result=> {
        res.json(result);
    });
    res.json({message: 'ok', user: req.user, jwt: req.authInfo});
});

router.put('/:id',  (req, res, next) => {
   const id= req.params.id;
   const queryString = req.query;
   const version = queryString.version;
    // TODO manage ?version=   =>const version = ??;
    res.json({message: 'update', id, version});
});


router.delete('/:id',  (req, res, next) => {
    const id= req.params.id;
    const queryString = req.query;
    const version = queryString.version;
    res.json({message: 'delete', id, version});
});

router.post('/',  (req, res, next) => {
    res.json({message: 'create'});
});


module.exports = router;
