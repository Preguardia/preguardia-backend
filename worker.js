var Queue = require('firebase-queue');
var Firebase = require('firebase');
var gcm = require('node-gcm');

const FIREBASE_URL = 'https://medicapp.firebaseio.com';
const FIREBASE_USERS = 'users';
const FIREBASE_QUEUE = 'queue';
const FIREBASE_USER_REGISTER_ID = 'gcmRegisterId';

const GCM_SENDER_ID = 'AIzaSyC6-cOT27aMoxhl-YDkZGJpdnU1cwanawg';
const GCM_TOPIC_MEDIC = '/topics/medic';

// Set up the sender with you API key
var sender = new gcm.Sender(GCM_SENDER_ID);

var queueRef = new Firebase(FIREBASE_URL + '/' + FIREBASE_QUEUE);
var usersRef = new Firebase(FIREBASE_URL + '/' + FIREBASE_USERS);

var queue = new Queue(queueRef, function(data, progress, resolve, reject) {
    var message = new gcm.Message();

    // Read and process task data
    //console.log(data);

    var type = data.type;
    var content = data.content;
    var consultationId = data.consultationId;

    message.addData('type', type);
    message.addData('consultationId', consultationId);

    if (type == 'new-consultation') {
        message.addData('title', 'Nueva consulta médica');
        message.addData('message', content);

        console.log("> New Consultation");

        sender.sendNoRetry(message, { topic: GCM_TOPIC_MEDIC }, function (err, response) {
            if(err) {
                console.error("< New Consultation - Notification not sent - Error: " + err);
            } else {
                console.log("< New Consultation - Notification sent - Response: " + response);

                resolve();
            }
        });
    } else if (type == 'consultation-approved') {
        message.addData('title', 'Consulta aprovada');
        message.addData('message', content);

        console.log("> Consultation Approved");

        var patientId = data.patientId;

        // Retrieve GCM Token
        usersRef.child(patientId).child(FIREBASE_USER_REGISTER_ID).once("value", function(data) {
            var registerId = data.val();
            var registrationTokens = [];

            console.log("- User regId found: " + registerId);

            // Add Register ID
            registrationTokens.push(registerId);

            // Send notification for that Patient
            sender.sendNoRetry(message, { registrationTokens: registrationTokens }, function (err, response) {
                if(err) {
                    console.error("< Consultation Approved - Notification not sent - Error: " + err);
                } else {
                    console.log("< Consultation Approved - Notification sent - Response: " + response);

                    resolve();
                }
            });
        });
    }
});
