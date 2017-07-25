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
 * Get By Id
 */
router.get('/',  (req, res, next) => {
    const queryString = req.query;
    const version = queryString.version;
    res.json({message: "TODO Search"});
});


/**
 * Get By Id
 */
router.get('/:id',  (req, res, next) => {
    const id= req.params.id;
    const queryString = req.query;
    const version = queryString.version;
    Sam.getById({id, version}).then(result=> {
        res.json(result);
    }).catch(manageError);
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
    }).catch(manageError);

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
    }).catch(manageError);
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
    }).catch(manageError);

});


module.exports = router;
