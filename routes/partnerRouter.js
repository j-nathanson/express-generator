// import express
const express = require('express');
// object we can use express routing methods
const partnerRouter = express.Router();

// Router for '/partners'. router object methods are chained instead of called separately. 
partnerRouter.route('/')
    .all((req, res, next) => {
        // ALL HTTP Verbs
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        // GET request
        res.end('Will send all the partners to you');
    })
    .post((req, res) => {
        // Post request
        res.end(`Will add the partner: ${req.body.name} with description: ${req.body.description}`);
    })
    .put((req, res) => {
        //PUT request
        res.statusCode = 403;
        res.end('PUT operation not supported on /partners');
    })
    .delete((req, res) => {
        // DELETE request
        res.end('Deleting all partners');
    });

// Routing for specific partner
partnerRouter.route('/:partnerId')
    .all((req, res, next) => {
        // ALL HTTP Verbs
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        // GET request
        res.end(`Will send details of the partner: ${req.params.partnerId} to you`);
    })
    .post((req, res) => {
        // Post request
        res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
    })
    .put((req, res) => {
        //PUT request
        res.write(`Updating the partner: ${req.params.partnerId}\n`);
        res.end(`Will update the partner: ${req.body.name}
        with description: ${req.body.description}`);
    })
    .delete((req, res) => {
        // DELETE request
        res.end(`Deleting partner: ${req.params.partnerId}`);
    });


// export the router
module.exports = partnerRouter;