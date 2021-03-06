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

// connect to database
mongoose.connect('mongodb://localhost:27017');

// set schema
var Stream = require('./app/models/stream');
var Event = require('./app/models/event');

// ERROR JSON
var err_400 = "./app/errors/400.json";
var err_404 = "./app/errors/404.json";

// ROUTES FOR API

// get instance
var router = express.Router();

// middleware to use for all requests
router.use(function (req, res, next) {
    //console.log(req.ip, req.hostname);
    console.log(req.method, req.originalUrl);
    next();
});

router.get('/', function (req, res) {
    res.sendfile("./package.json");
});

router.route('/streams')

    // create a stream (accessed at POST http://localhost:8080/api/v1/streams)
    .post(function (req, res) {

        var stream = new Stream();      // create a new instance of the Stream model
        console.log('Request Body :', req.body);
        stream.name = req.body.name;
        stream.description = req.body.description || '';
        stream.url = req.body.url;
        stream.state = req.body.state || 0;

        // save the stream and check for errors
        stream.save(function (err) {
            if (err) {
                res.status(400).sendfile(err_400);
            }
            else {
                console.log('POST New Stream :', stream);
                res.status(201).json(stream);
            }
        });

    })
    .get(function (req, res) {
        console.log(req.query);
        var querySearch = {};

        for (key in req.query) {
            querySearch[key] = new RegExp(req.query[key], 'gi');
        }
        console.log(querySearch);
        Stream
            .find(querySearch, function (err, streams) {
                if (err) {
                    res.status(404).sendfile(err_404);
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
        Stream
            .findById(req.params.stream_id, function (err, stream) {
                if (err) {
                    res.status(404).sendfile(err_404);
                }
                else {
                    res.status(200).json(stream);
                }
            });
    })
    // PUT
    .put(function (req, res) {

        // use our bear model to find the bear we want
        Stream
            .findById(req.params.stream_id, function (err, stream) {

                if (err) {
                    res.send(err);
                }
                else {
                    for (prop in req.body) {
                        stream[prop] = req.body[prop];
                    }
                    //stream.name = req.body.name;
                    //stream.description = req.body.description;
                    //stream.url = req.body.url;
                    //stream.state = req.body.state || 0;

                    // save the stream
                    stream.save(function (err) {
                        if (err) {
                            res.status(404).sendfile(err_400);
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
        Stream
            .remove({
                _id: req.params.stream_id
            }, function (err, stream) {
                if (err) {
                    res.status(400).sendfile(err_400);
                }
                else {
                    console.log('DELETE Stream :', stream);
                    res.status(204).end();
                }
            });
    })
;

router.route('/events')

    // create a stream (accessed at POST http://localhost:8080/api/v1/streams)
    .post(function (req, res) {

        var event = new Event();      // create a new instance of the Stream model
        console.log('Request Body :', req.body);
        event.name = req.body.name;
        event.streams = req.body.streams;

        // save the stream and check for errors
        event.save(function (err) {
            if (err) {
                res.status(400).sendfile(err_400);
            }
            else {
                console.log('POST New Stream :', event);
                res.status(201).json(event);
            }
        });

    })
    .get(function (req, res) {
        console.log(req.query);
        Event
            .find(req.query)
            .populate('streams')
            .exec(function (err, events) {
                if (err) {
                    res.status(404).sendfile(err_404);
                }
                else {
                    console.log('GET Events Size :', events.length);
                    res.status(200).json(events);
                }
            });
    })
;

router.route('/events/:event_id')

    // GET
    .get(function (req, res) {

        Event
            .findById(req.params.event_id)
            .populate('streams')
            .exec(function (err, event) {
                if (err) {
                    res.status(404).sendfile(err_404);
                }
                else {
                    res.status(200).json(event);
                }
            });
    })
    // PUT
    .put(function (req, res) {

        Event
            .findById(req.params.event_id, function (err, event) {

                if (err) {
                    res.status(404).sendfile(err_404);
                }
                else {
                    for (prop in req.body) {
                        event[prop] = req.body[prop];
                    }
                    //event.name = req.body.name;
                    //event.streams = req.body.streams;

                    // save the stream
                    event.save(function (err) {
                        if (err) {
                            res.status(400).sendfile(err_400);
                        }
                        else {
                            console.log('PUT Stream :', event);
                            res.status(200).json(event);
                        }
                    });
                }
            });
    })

    // DELETE
    .delete(function (req, res) {
        Event
            .remove({
                _id: req.params.event_id
            }, function (err, event) {
                if (err) {
                    res.status(400).sendfile(err_400);
                }
                else {
                    console.log('DELETE Event :', event);
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
