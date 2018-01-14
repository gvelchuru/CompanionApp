var firebase = require("firebase");
require('firebase/firestore');

var bodyParser = require('body-parser');
var geopoint = require('geopoint');
var express = require('express');
var path = require('path');


var app = express();

// app.engine('html', require('ejs').renderFile);
// app.engine('html');

app.use("/public", express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({extended: false});
// Initialize Firebase
var config = {
    apiKey: "AIzaSyAjf0slvgGxRlI5wujzu8Nsp-_SJgsmsb4",
    authDomain: "companion-app-e1b98.firebaseapp.com",
    databaseURL: "https://companion-app-e1b98.firebaseio.com",
    projectId: "companion-app-e1b98",
    storageBucket: "companion-app-e1b98.appspot.com",
    messagingSenderId: "843176657895"
};
firebase.initializeApp(config);

// database reference point
var db = firebase.firestore();


app.get('/', function (req, res) {
    // res.sendFile(path.join(__dirname + '/test.html'));
    res.render('index.ejs');
});

app.post('/sendData', urlencodedParser, function (req, res) {
    var name = req.body.nameData;

    var lat = req.body.lat;
    var long = req.body.long;

    var destLat = req.body.dest_lat;
    var destLong = req.body.dest_long;
    // console.log('lat',parseFloat(lat).toFixed(2));
    // console.log('longitude',parseFloat(longitude).toFixed(2));
    // var loc=new GeoPoint(longitude,lat);

    console.log("Destination Coordinates: " + destLat + ", " + destLong)

    var time = req.body.time;

    var docRef = db.collection('users').doc(name);

    var setAda = docRef.set({
        name: name,
        loc: new firebase.firestore.GeoPoint(parseFloat(lat), parseFloat(long)),
        dest: new firebase.firestore.GeoPoint(parseFloat(destLat), parseFloat(destLong)),
        time: time
    });

    // res.render('test.ejs')
    // res.render('table.ejs',{})
    res.redirect('table/'+name);


});

app.get('/table',function(req,res){
    var name = req.query.name;
    var result = null;

    var user_data = db.collection('users').doc(name).get()

        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                console.log('Document data:', doc.data());
                // return JSON.stringify(doc.data());
                console.log('again', doc.data());
                // return JSON.stringify(doc.data());
                result = doc.data();
                console.log('orderedCompanions',result.orderedCompanions);
                // res.send(result);
                res.render('table.ejs',{result:result});
            }
        }).then(function () {
            return result;
        })
        .catch(err => {
            console.log('Error getting document', err);
        });

    
});

app.get('/confirm',function(req,res){
    var name = req.query.name;
    var index =req.query.index;
    var result = null;
    var individual=null;
    // console.log(name);
    var user_data = db.collection('users').doc(name).get()

        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                console.log('Document data:', doc.data());
                // return JSON.stringify(doc.data());
                console.log('again', doc.data());
                // return JSON.stringify(doc.data());

                // result=doc.data()['orderedCompanions'];
                result=doc.data();

                individual=result.orderedCompanions[index];

                // res.send(result);

            }
            console.log('result', result);
            console.log('individual',individual);
            // res.render('confirm.ejs');
            res.render('confirm.ejs', {result: result,individual:individual});
        })
        .catch(err => {
            console.log('Error getting document', err);
        });


    
});

app.get('/map', function (req, res) {
    var name = req.query.name;
    var result = null;
    // console.log(name);
    var user_data = db.collection('users').doc(name).get()

        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                console.log('Document data:', doc.data());
                // return JSON.stringify(doc.data());
                console.log('again', doc.data());
                // return JSON.stringify(doc.data());

                // result=doc.data()['orderedCompanions'];
                result=doc.data();


                // res.send(result);

            }
            console.log('result', result);

            res.render('map_multiple.ejs', {result: result});
        })
        .catch(err => {
            console.log('Error getting document', err);
        });


});

app.post('/getUserData', urlencodedParser, function (req, res) {
    var name = req.body.name;
    // console.log(req.body);
    // console.log(name);
    // res.send('1');
    // var jsonresult=getClosestUsersTo(name);
    // console.log("hello",getClosestUsersTo(name));
    // console.log('here it is');
    // console.log(jsonresult);
    // res.send(jsonresult);
    var user_data = db.collection('users').doc(name).get()

        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                console.log('Document data:', doc.data());
                // return JSON.stringify(doc.data());
                console.log('again', doc.data());
                // return JSON.stringify(doc.data());
                result = doc.data();
                res.send(result);
            }
        }).then(function () {
            return result;
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
});

app.post('/filter', function (req, res) {
    // takes a source and a destination
    // returns lat long pairs and value(heat level/# of crimes)
    var source = req.query.source;
    var dest = req.query.dest;
    var min_lat = Math.min(source.latitude, dest.latitude);
    var max_lat = Math.max(source.latitude, dest.latitude);
    var min_long = Math.min(source.longitude, dest.longitude);
    var max_long = Math.max(source.longitude, dest.longitude);
    var file = new File('/crime_results.json');
    var resultList = file.parseJSON();
    result_lat_longs = [];
    resultList.forEach(function(result) {
      if ((min_lat <= result[0]) && (result[0] <= max_lat) && (min_long <= result[1]) && (result[1] <= max_long)){
          for (i = 0; i < result[2]; i++) {
            result_lat_longs.push([result[0], result[1]]);
          }
      }
    });
    res.send(result_lat_longs);
});


app.listen(3000, () => console.log('Example app listening on port 3000!'))
