var firebase = require("firebase");
require('firebase/firestore');
const express = require('express');
var epp = express();

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAjf0slvgGxRlI5wujzu8Nsp-_SJgsmsb4",
    authDomain: "companion-app-e1b98.firebaseapp.com",
    databaseURL: "https://companion-app-e1b98.firebaseio.com",
    storageBucket: "companion-app-e1b98.appspot.com",
};
firebase.initializeApp(config);

var db = firebase.firestore();

function addUser(name, location, destination, time) {
    var docRef = db.collection('users').doc(name);

    var setAda = docRef.set({
        location: location,
        destination: destination,
        time: time
    });
}

function getClosestUsersTo(name) {
    var doc = db.collection('users').doc(name).collection('closestUsers').get();
    var closestUsers = doc.toJSON();
    return closestUsers;
}

app.listen(3000, () => console.log('Example app listening on port 3000'))
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
