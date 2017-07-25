var express = require('express');
var router = express.Router();

const Sam = require('../models/sam');

const manageError= function(req, res, next) {
    return function (err) {
        const status = err.status || 500;
        return res.status(status).json({status, message: err.message});
    };
};


/**
 * Search By Id
 */
router.get('/',  (req, res, next) => {
    const queryString = req.query;

    res.json({message: "TODO Search"});
});


/**
 * Get By Id
 */
router.get('/:id',  (req, res, next) => {
    const id= req.params.id;
    const queryString = req.query;
    const version = queryString.version;
    console.log('------------- getById request');
    Sam.getById({id, version}).then(result=> {
       console.log('------------- getById result', result);
        return  res.json(result);
    }).catch(manageError(req, res, next) );
});


/**
 * Delete By Id
 */
router.delete('/:id',  (req, res, next) => {
    const id= req.params.id;
    const queryString = req.query;
    const version = queryString.version;
    Sam.deleteSam(id, version).then(result => {
        res.json({message: 'delete', result});
    }).catch(manageError(req, res, next) );

});


/**
 * Update By Id
 */
router.put('/:id',  (req, res, next) => {
    const id= req.params.id;
    const queryString = req.query;
    const version = queryString.version;
    const body = req.body;
    Sam.updateSam(body, id, version).then(result => {
        if (result.created) {
            delete result.created;
            res.status(201);
        }
        return res.json(result);
    }).catch(manageError(req, res, next) );
});


/**
 * Create
 */
router.post('/',  (req, res, next) => {
    const body = req.body;
    Sam.createSam(body).then(result => {
        if (result.created) {
            delete result.created;
            res.status(201);
        }
        return res.json(result);
    }).catch(manageError(req, res, next) );

});


module.exports = router;
