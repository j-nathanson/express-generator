const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer'); //middleware for multi-part form data
const cors = require('./cors');

// config storage of form data
const storage = multer.diskStorage({
    // where it will be stored
    // null for no error, path
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    // set up name of file so they are the same on the client and backend server
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

// file filter so uploads must be in image format
const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    // null no error, true tell multer to use the file
    cb(null, true);
};

// create multer middleware with our configurations
const upload = multer({ storage: storage, fileFilter: imageFileFilter });

// create router
const uploadRouter = express.Router();

uploadRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    // GET not supported
    .get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /imageUpload');
    })
    // POST add an image, use multer, expect a single file for uploading
    // multer will handle errors
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(req.file);
    })
    // PUT not supported
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /imageUpload');
    })
    // DELETE not supported
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('DELETE operation not supported on /imageUpload');
    });

module.exports = uploadRouter;