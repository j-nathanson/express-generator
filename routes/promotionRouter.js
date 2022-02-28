// import express
const express = require('express');
// object we can use express routing methods
const promotionRouter = express.Router();

// Router for '/promotions'. router object methods are chained instead of called separately. 
promotionRouter.route('/')
    .all((req, res, next) => {
        // ALL HTTP Verbs
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        // GET request
        res.end('Will send all the promotions to you');
    })
    .post((req, res) => {
        // Post request
        res.end(`Will add the promotion: ${req.body.name} with description: ${req.body.description}`);
    })
    .put((req, res) => {
        //PUT request
        res.statusCode = 403;
        res.end('PUT operation not supported on /promotions');
    })
    .delete((req, res) => {
        // DELETE request
        res.end('Deleting all promotions');
    });

// Routing for specific promotion
promotionRouter.route('/:promotionId')
    .all((req, res, next) => {
        // ALL HTTP Verbs
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        // GET request
        res.end(`Will send details of the promotion: ${req.params.promotionId} to you`);
    })
    .post((req, res) => {
        // Post request
        res.end(`POST operation not supported on /promotions/${req.params.promotionId}`);
    })
    .put((req, res) => {
        //PUT request
        res.write(`Updating the promotion: ${req.params.promotionId}\n`);
        res.end(`Will update the promotion: ${req.body.name}
        with description: ${req.body.description}`);
    })
    .delete((req, res) => {
        // DELETE request
        res.end(`Deleting promotion: ${req.params.promotionId}`);
    });


// export the router
module.exports = promotionRouter;