// import express and our campsite model for packaging/searchingfor  the data
const express = require('express');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');

// object we can use express routing methods
const campsiteRouter = express.Router();


// Router for '/campsites'. 
campsiteRouter.route('/')
    // get data on all campsites, no authenication needed
    .get((req, res, next) => {
        // use moosegose client Model to find all of this model
        Campsite.find()
            // when retrieving the Campsite documents, also set off function to find value the ref was pointing to and store in the subdocuments array
            .populate('comments.author')
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
    // POST add a campsite, needs to be authenticated based on info in the req/url
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
    .put(authenticate.verifyUser, (req, res) => {
        //PUT request
        res.status = 403;
        res.end('PUT operation not supported on /campsites');
    })
    // DELETE all campsites
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
            .populate('comments.author')
            // if successfully found
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    // POST request not supported
    .post(authenticate.verifyUser, (req, res) => {
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
    })
    // PUT update a campsite by id new:true returns the new updated object
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.findByIdAndDelete(req.params.campsiteId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

// Router for a specific campsite's comments
// only one :
campsiteRouter.route('/:campsiteId/comments')
    // GET 
    .get((req, res, next) => {
        // first find the specific campsite
        Campsite.findById(req.params.campsiteId)
            .populate('comments.author')
            // if it exists send all the comments
            .then(campsite => {
                // possible for null value to be returned
                if (campsite) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite.comments);
                } else {
                    // create custom error if the campsite was not found/null
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    // POST add a comment to a campsite's comment array
    .post(authenticate.verifyUser, (req, res, next) => {
        //  find campsite
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                // if not null and truthy
                if (campsite) {
                    // add id of the user into the body before it gets pushed into the array
                    req.body.author = req.user._id;
                    // add comment to the array
                    campsite.comments.push(req.body);
                    // attempt to save the change
                    campsite.save()
                        // if pass send respons back to client
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    // PUT not supported
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
    })
    // DELETE every comment in the campsite's array
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    // loop through comments array and remove each object
                    for (let i = (campsite.comments.length - 1); i >= 0; i--) {
                        campsite.comments.id(campsite.comments[i]._id).remove();
                    }
                    // attempt to save
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

// Router for a specific comment in a specific campsite
// 
campsiteRouter.route('/:campsiteId/comments/:commentId')
    // GET 
    .get((req, res, next) => {
        //find campsite
        Campsite.findById(req.params.campsiteId)
            .populate('comments.author')
            .then(campsite => {
                // if not null and has the same id from the path, send comment to client
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite.comments.id(req.params.commentId));
                } else if (!campsite) {
                    // if campsite is null/undefined doesn't exist
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    // if comment is null/undefined doesn't exist
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    // POST not supported
    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
    })
    // PUT update a specific comment, only update comment text and rating field
    .put(authenticate.verifyUser, (req, res, next) => {
        // find the campsite
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                // check if comment in that campsite exists
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    // check if the comment author is the same as the user
                    if ((campsite.comments.id(req.params.commentId).author).equals(req.user._id)) {
                        // if the user gives a new rating is truthy update the old rating
                        if (req.body.rating) {
                            campsite.comments.id(req.params.commentId).rating = req.body.rating;
                        }
                        // if the user gives a new text is truthy update the old text
                        if (req.body.text) {
                            campsite.comments.id(req.params.commentId).text = req.body.text;
                        }
                        // attempt to save, log successful updating
                        campsite.save()
                            .then(campsite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(campsite);
                            })
                            .catch(err => next(err));
                    } else {
                        err = new Error(`You cannot update a comment you are not the author of.`);
                        err.status = 403;
                        return next(err);
                        // comment doesn't exist
                    }
                    // campsite doesn't exist
                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                    // comment doesn't exist
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    // DELETE a specific comment in the campsite's array
    .delete(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                // if campsite and comment exist delete the specific comment
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    // check if the comment author is the same as the user
                    if ((campsite.comments.id(req.params.commentId).author).equals(req.user._id)) {
                        campsite.comments.id(req.params.commentId).remove();
                        // attempt to save
                        campsite.save()
                            .then(campsite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(campsite);
                            })
                            .catch(err => next(err));
                        // user is not the author
                    } else {
                        err = new Error(`You cannot delete a comment you are not the author of.`);
                        err.status = 403;
                        return next(err);
                    }
                    // comment doesn't exist
                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });


// export the router
module.exports = campsiteRouter;