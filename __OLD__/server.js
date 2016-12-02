"use strict";

var express = require("express"),
    bodyParser = require("body-parser"),
    http = require("http"),
    Yelp = require("yelp"),
    mongoose = require("mongoose"),
    app = express(),
    configAuth = require('./config');

//// VAR FOR IMAGE UPLOAD IN REVIEW ////////
var multer = require('multer'),
    file_name,
    final_filepath;


var yelp = new Yelp(configAuth.yelp);

app.use(express.static("."));
app.use(bodyParser.json({
    type: 'application/*+json'
}));
app.use(bodyParser.urlencoded({
    extended: false
}));


//////// MONGODB CONNECTION //////////////
mongoose.connect("mongodb://admin:admin@ds015942.mlab.com:15942/foodnearme", function(error, success) {
    if (error) {
        console.log("Error connecting to database: \n" + error);
    } else {
        console.log('Connected to Database');
    }
});

var reviewSchema = mongoose.Schema({
    restaurant: String,
    rating: Number,
    written: String,
    restaurantID: String,
    date: String,
    image: String
});

var reviews = mongoose.model("reviews", reviewSchema);

///////// IMAGE UPLOAD FUNCTIONS ///////

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads');

    },
    filename: function(req, file, callback) {
        var file_type = file.mimetype.split("/")[1];
        file_name = file.fieldname + '-' + Date.now() + '.' + file_type;
        callback(null, file_name);
        final_filepath = "/uploads/" + file_name;
    }
});

var upload = multer({
    storage: storage
}).single('userphoto');

//////// IMAGE FUNCTIONS DONE //////////


////////// ROUTES ///////////////
app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get('/find', function(req, res) {
    console.log("Latitude = " + req.query.latitude);
    console.log("Longitude = " + req.query.longitude);

    var swLat = parseFloat(req.query.latitude) - 0.0075;
    var swLong = parseFloat(req.query.longitude) - 0.0075;
    var neLat = parseFloat(req.query.latitude) + 0.0075;
    var neLong = parseFloat(req.query.longitude) + 0.0075;

    yelp.search({
        term: "food",
        bounds: swLat + "," + swLong + "|" + neLat + "," + neLong
    })
        .then(function(data) {
            res.json(data);
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.post('/review', function(req, res) {
    var tempReview = new reviews({
        restaurant: req.body.restaurant,
        rating: req.body.rating,
        written: req.body.written,
        restaurantID: req.body.restaurantID,
        date: req.body.date,
        image: req.body.image
    });
    console.log(tempReview);

    tempReview.save(function(err, tempReview) {
        if (err) {
            return console.log(err);
        }
        console.log("Review Successfully Saved!");
        res.json(tempReview);
    });
});

app.get('/review', function(req, res) {
    reviews.find({
        restaurant: req.query.restaurant
    }, function(err, obj) {
        if (err) {
            return console.log(err);
        }
        res.json(obj);
    });
});

app.post('/api/photo', function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            return res.end("Error uploading file.");
        }
        res.send(final_filepath);
    });
});

//////// SERVER CONNECTION ///////////
http.createServer(app).listen(3000, function() {
    console.log('Server listening on port 3000');
});