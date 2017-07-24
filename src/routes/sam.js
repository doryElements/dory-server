var express = require('express');
var router = express.Router();

const Sam = require('../models/sam');

const manageError= function(req, res, next) {
    return function (err) {
        const status = err.status || 500;
        return res.status(status).json({status, message: err.message});
    }
};

router.get('/:id',  (req, res, next) => {
    const id= req.params.id;
    const queryString = req.query;
    const version = queryString.version;
    Sam.getById({id, version}).then(result=> {
        res.json(result);
    }).catch(manageError);
});

router.put('/:id',  (req, res, next) => {
   const id= req.params.id;
   const queryString = req.query;
   const version = queryString.version;
   const body = req.body;
    Sam.updateSam(body, id, version).then(result => {
        return res.json({message: 'update', id, version, body});
    }).catch(manageError);
});



router.delete('/:id',  (req, res, next) => {
    const id= req.params.id;
    const queryString = req.query;
    const version = queryString.version;
    Sam.deleteSam(id, version).then(result => {
        res.json({message: 'delete', id, version});
    }).catch(manageError);;

});

router.post('/',  (req, res, next) => {
    const body = req.body;
    Sam.createSam(body).then(result => {
        res.json({message: 'create', body});
    }).catch(manageError);;

});


module.exports = router;
