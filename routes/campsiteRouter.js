// import express and our campsite model for packaging/searchingfor  the data
const express = require('express');
const Campsite = require('../models/campsite');

// object we can use express routing methods
const campsiteRouter = express.Router();


// Router for '/campsites'. router object methods are chained instead of called separately. 
campsiteRouter.route('/')
    // get data on all campsites
    .get((req, res, next) => {
        // use moosegose client Model to find all of this model
        Campsite.find()
            // access the results promise and send json to user
            .then(campsites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                // send JSON to the client
                res.json(campsites);
            })
            // pass off error to overall error catcher in express
            .catch(err => next(err));
    })
    // POST a campsite
    .post((req, res, next) => {
        // create save new campsite doc from the req body which was parsed from express
        Campsite.create(req.body)
            // if successfully added to the db send back to the server
            .then(campsite => {
                console.log('Campsite Created ', campsite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    .put((req, res) => {
        //PUT request
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites');
    })
    // DELETE all campsites
    .delete((req, res, next) => {
        // mongoose delete all method
        Campsite.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

// Routing for specific campsite
campsiteRouter.route('/:campsiteId')
    // GET specific campsite
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            // if successfully found
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    // POST request not supported
    .post((req, res) => {
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
    })
    // PUT update a campsite by id new:true returns the new updated object
    .put((req, res, next) => {
        // to db
        Campsite.findByIdAndUpdate(req.params.campsiteId, {
            $set: req.body
        }, { new: true })
        // to client
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    // DELETE a campite by id
    .delete((req, res, next) => {
        Campsite.findByIdAndDelete(req.params.campsiteId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });


// export the router
module.exports = campsiteRouter;