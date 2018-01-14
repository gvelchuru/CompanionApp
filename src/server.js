var firebase = require("firebase");
require('firebase/firestore');
const express = require('express');
var app = express();

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

app.get('/',function(req,res){
	db.collection('users').get()
    .then((snapshot) => {
        snapshot.forEach((doc) => {
            console.log(doc.id, '=>', doc.data());
        });
    })
    .catch((err) => {
        console.log('Error getting documents', err);
    });
})

// Adds a user to the database
function addUser(name, location, destination, time) {
    var docRef = db.collection('users').doc(name);

    var setAda = docRef.set({
        location: location,
        destination: destination,
        time: time
    });
}

// Client call for adding a user
app.get('/adduser', function(req, res) {
    var user = req.query.user;
    var location = req.query.location;
    var destination = req.query.destination;
    var time = req.query.time;

    addUser(user, location, destination, time);
})

// Gets the array of users closest to the given 'user'
function getClosestUsersTo(user) {
    var doc = db.collection('users').doc(user).collection('closestUsers').get();
    var closestUsers = doc.toJSON();
    return closestUsers;
}

app.listen(3000, () => console.log('Example app listening on port 3000!'))
/****************************************************************************************/
// // Initialize Firebase
// var config = {
//     apiKey: "AIzaSyAjf0slvgGxRlI5wujzu8Nsp-_SJgsmsb4",
//     authDomain: "companion-app-e1b98.firebaseapp.com",
//     databaseURL: "https://companion-app-e1b98.firebaseio.com",
//     projectId: "companion-app-e1b98",
//     storageBucket: "companion-app-e1b98.appspot.com",
//     messagingSenderId: "843176657895"
// };
// firebase.initializeApp(config);
