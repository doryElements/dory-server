// Logger
const logger = require('../logger');

const express = require('express');
const router = express.Router();

const Sam = require('../models/sam');

const manageError= function(req, res, next) {
    return function (err) {
        const status = err.status || 500;
        return res.status(status).json({status, message: err.message});
    };
};


/**
 * Search By Params
 */
router.get('/',  (req, res, next) => {
    const queryString = req.query;
    Sam.getByParams(queryString.app , queryString.fields,  queryString.size, queryString.from).then(result =>{
        return res.json(result);
    }).catch(manageError(req,res,next));
});


/**
 * Get By Id
 */
router.get('/:id',  (req, res, next) => {
    const id= req.params.id;
    const queryString = req.query;
    const version = queryString.version;
    Sam.getById({id, version}).then(result=> {
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
    Sam.delete(id, version).then(result => {
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
    Sam.update(body, id, version).then(result => {
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
    logger.debug('-------- router.post', Sam);

    Sam.create(body).then(result => {
        if (result.created) {
            delete result.created;
            res.status(201);
        }
        return res.json(result);
    }).catch(manageError(req, res, next) );

});


module.exports = router;
