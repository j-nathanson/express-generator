const cors = require('cors');

// acceptable origins unsecure and secure 
const whitelist = ['http://localhost:3000', 'https://localhost:3443'];

const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    // check the origin header from the client
    console.log(req.header('Origin'));
    // if it is the whitelist (-1 is truthy) 
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }; //set cors origin option to true
    } else {
        // not found in whitelist
        corsOptions = { origin: false }; //set cors origin option to true
    }
    // no errors occurred
    callback(null, corsOptions);
};

// export two middleware functions

// cors() to config cors headers access-control-allow-origin on a res object with a * as a value, allow cors for all origins
exports.cors = cors(); 


// corsOptionsDelegate() check to see if the incoming req belongs to one of the whitelist origns. If it doesn't won't include the cors header
exports.corsWithOptions = cors(corsOptionsDelegate); 