// server.js

// BASE SETUP

// packages

// call express
var express = require('express');

// define app
var app = express();

// call body-parser
var bodyParser = require('body-parser');

// configure app to use bodyParser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// set port
var port = process.env.PORT || 1337;

// set MongoDB via mongoose
var mongoose = require('mongoose');

// connect to our database
mongoose.connect('mongodb://localhost:27017');

// set schema
var Stream = require('./app/models/stream');

// ERROR JSON
var err_400 = "./app/errors/400.json";
var err_404 = "./app/errors/404.json";

// ROUTES FOR API

// get instance
var router = express.Router();

// middleware to use for all requests
router.use(function (req, res, next) {
    console.log(req.ip, req.hostname);
    console.log(req.method, req.originalUrl);
    next();
});

router.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to my api!'});
});

router.route('/streams')

    // create a stream (accessed at POST http://localhost:8080/api/v1/streams)
    .post(function (req, res) {

        var stream = new Stream();      // create a new instance of the Stream model
        console.log('Request Body :', req.body);
        stream.name = req.body.name;
        stream.description = req.body.description;
        stream.url = req.body.url;
        stream.state = req.body.state || 0;

        // save the stream and check for errors
        stream.save(function (err) {
            if (err) {
                res.sendfile(err_400);
            }
            else {
                console.log('POST New Stream :', stream);
                res.status(201).json(stream);
            }
        });

    })
    .get(function (req, res) {
        console.log(req.query);
        Stream.find(req.query ,function (err, streams) {
            if (err) {
                res.sendfile(err_404);
            }
            else {
                console.log('GET Streams Size :', streams.length);
                res.status(200).json(streams);
            }

        });
    })
;

router.route('/streams/:stream_id')

    // GET
    .get(function (req, res) {
        Stream.findById(req.params.stream_id, function (err, stream) {
            if (err) {
                res.sendfile(err_404);
            }
            else {
                res.status(200).json(stream);
            }
        });
    })
    // PUT
    .put(function (req, res) {

        // use our bear model to find the bear we want
        Stream.findById(req.params.stream_id, function (err, stream) {

            if (err) {
                res.send(err);
            }
            else {
                stream.name = req.body.name;
                stream.description = req.body.description;
                stream.url = req.body.url;
                stream.state = req.body.state || 0;

                // save the stream
                stream.save(function (err) {
                    if (err) {
                        res.sendfile(err_400);
                    }
                    else {
                        console.log('PUT Stream :', stream);
                        res.status(200).json(stream);
                    }
                });
            }
        });
    })

    // DELETE
    .delete(function (req, res) {
        Stream.remove({
            _id: req.params.stream_id
        }, function (err, stream) {
            if (err) {
                res.sendfile(err_400);
            }
            else {
                console.log('DELETE Stream :', stream);
                res.status(204).end();
            }
        });
    })
;


// REGISTER ROUTES
app.use('/api/v1', router);

// SET STATIC ROUTES
var path_public = __dirname + '/public';
app.use(express.static(path_public));

app.listen(port);
console.log('REST API started at : http://localhost:' + port);
