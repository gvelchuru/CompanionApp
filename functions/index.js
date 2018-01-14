// const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Take the text parameter passed to this HTTP endpoint and insert it into the
// // Realtime Database under the path /messages/:pushId/original
// exports.addMessage = functions.https.onRequest((req, res) => {
//     // Grab the text parameter.
//     const original = req.query.text;
// // Push the new message into the Realtime Database using the Firebase Admin SDK.
//     admin.database().ref('/messages').push({original: original}).then(snapshot => {
//         // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
//         res.redirect(303, snapshot.ref);
//     });
// });
//
// // Listens for new messages added to /messages/:pushId/original and creates an
// // uppercase version of the message to /messages/:pushId/uppercase
// exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
//     .onWrite(event => {
//     // Grab the current value of what was written to the Realtime Database.
//     const original = event.data.val();
// console.log('Uppercasing', event.params.pushId, original);
// const uppercase = original.toUpperCase();
// // You must return a Promise when performing asynchronous tasks inside a Functions such as
// // writing to the Firebase Realtime Database.
// // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
// return event.data.ref.parent.child('uppercase').set(uppercase);
// });
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * Math.PI/180;
}


exports.createUser = functions.firestore
    .document('users/{userId}')
    .onWrite(event => {
        var list = [];
        var db = admin.firestore();
        db.collection("users").get().then(function(findClosest) {
          findClosest.forEach(function(doc) {
            console.log(doc);
            var dict = doc.data();
            var srcDict = event.data.data();
            var lat1 = srcDict["loc"].latitude;
            var lon1 = srcDict["loc"].longitude;
            var lat2 = dict["loc"].latitude;
            var lon2 = dict["loc"].longitude;
            var srcDistances = getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2);
            lat1 = srcDict["dest"].latitude;
            lon1 = srcDict["dest"].longitude;
            lat2 = dict["dest"].latitude;
            lon2 = dict["dest"].longitude;
            var destDistances = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
            absoluteTime = new Date(srcDict.time);
            buddyTime = new Date(dict.time);
            timeDiffs = buddyTime.getTime() - absoluteTime.getTime();
            clusteredDist = Math.sqrt(Math.pow(srcDistances, 2) + Math.pow(destDistances, 2) + Math.pow(timeDiffs, 2));
            list.push({name : dict["name"], src : dict["loc"], dest : dict["dest"], srcDistance : srcDistances, destDistance : destDistances, time : dict["time"], timeDiff : timeDiffs, clusteredDistance : clusteredDist});
          });
          list.sort(BuddySort);
        db.collection("users").doc(event.params.userId).set({
          orderedCompanions : list,
        }, {merge: true});
        });
    });


function BuddySort(first, second)
{
  return first.clusteredDistance - second.clusteredDistance;
}
