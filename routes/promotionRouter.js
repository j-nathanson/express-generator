// import express
const express = require('express');
// object we can use express routing methods
const promotionRouter = express.Router();
const Promotion = require('../models/promotion');
const authenticate = require('../authenticate');
const cors = require('./cors');

// Router for '/promotions'. router object methods are chained instead of called separately. 
promotionRouter.route('/')
    // OPTIONS
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    // GET all promotions
    .get(cors.cors, (req, res, next) => {
        // use moosegose client Model to find all of this model
        Promotion.find()
            // access the results promise and send json to user
            .then(promotions => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                // send JSON to the client
                res.json(promotions);
            })
            // pass off error to overall error catcher in express
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // POST create() will save new campsite doc from the req body which was parsed from express
        Promotion.create(req.body)
            // if successfully added to the db send back to the server
            .then(promotion => {
                console.log('Promotion Created ', promotion);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        //PUT request
        res.statusCode = 403;
        res.end('PUT operation not supported on /promotions');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // DELETE all promotions
        Promotion.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

// Routing for specific promotion
promotionRouter.route('/:promotionId')
    // OPTIONS
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    // GET
    .get(cors.cors, (req, res, next) => {
        Promotion.findById(req.params.promotionId)
            // if successfully found
            .then(promotion => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // Post request
        res.end(`POST operation not supported on /promotions/${req.params.promotionId}`);
    })
    // PUT update a promotion by id new:true returns the new updated object
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        // to db
        Promotion.findByIdAndUpdate(req.params.promotionId, {
            $set: req.body
        }, { new: true })
            // to client
            .then(promotion => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            })
            .catch(err => next(err));
    })
    // DELETE a promotion by id
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Promotion.findByIdAndDelete(req.params.promotionId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });


// export the router
module.exports = promotionRouter;