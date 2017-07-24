var express = require('express');
var router = express.Router();

const Sam = require('../models/sams');

router.get('/:id',  (req, res, next) => {
    const id= req.params.id;
    Sam.getById({id}).then(result=> {
        res.json(result);
    });
});

router.put('/:id',  (req, res, next) => {
   const id= req.params.id;
   const queryString = req.query;
   const version = queryString.version;
   const body = req.body;
    // TODO manage ?version=   =>const version = ??;
    res.json({message: 'update', id, version, body});
});


router.delete('/:id',  (req, res, next) => {
    const id= req.params.id;
    const queryString = req.query;
    const version = queryString.version;
    res.json({message: 'delete', id, version});
});

router.post('/',  (req, res, next) => {
    const body = req.body;
    res.json({message: 'create', body});
});


module.exports = router;
