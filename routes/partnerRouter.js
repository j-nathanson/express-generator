// import express
const express = require('express');
// object we can use express routing methods
const partnerRouter = express.Router();
const Partner = require('../models/partner');
const authenticate = require('../authenticate');

// Router for '/partners'. router object methods are chained instead of called separately. 
partnerRouter.route('/')
    // GET data on all campsites
    .get((req, res, next) => {
        // use moosegose client Model to find all of this model
        Partner.find()
            // access the results promise and send json to user
            .then(partners => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                // send JSON to the client
                res.json(partners);
            })
            // pass off error to overall error catcher in express
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // POST create save new partner doc from the req body which was parsed from express
        Partner.create(req.body)
            // if successfully added to the db send back to the server
            .then(partner => {
                console.log('Partner Created ', partner);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(partner);
            })
            .catch(err => next(err));
    })
    .put(authenticate.verifyUser, (req, res) => {
        //PUT request
        res.statusCode = 403;
        res.end('PUT operation not supported on /partners');
    })
    // DELETE all partners
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // mongoose delete all method
        Partner.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

// Routing for specific partner
partnerRouter.route('/:partnerId')
    // GET specific partner
    .get((req, res, next) => {
        Partner.findById(req.params.partnerId)
            // if successfully found
            .then(partner => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(partner);
            })
            .catch(err => next(err));
    })
    // POST request not supported
    .post(authenticate.verifyUser, (req, res) => {
        res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
    })
    // PUT update a partner by id new:true returns the new updated object
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // to db
        Partner.findByIdAndUpdate(req.params.partnerId, {
            $set: req.body
        }, { new: true })
            // to client
            .then(partner => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(partner);
            })
            .catch(err => next(err));
    })
    // DELETE a partner by id
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Partner.findByIdAndDelete(req.params.partnerId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });


// export the router
module.exports = partnerRouter;