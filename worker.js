var Queue = require('firebase-queue');
var Firebase = require('firebase');
var gcm = require('node-gcm');

// Set up the sender with you API key
var sender = new gcm.Sender('AIzaSyC6-cOT27aMoxhl-YDkZGJpdnU1cwanawg');

var queueRef = new Firebase('https://medicapp.firebaseio.com/queue');
var usersRef = new Firebase('https://medicapp.firebaseio.com/users');

var queue = new Queue(queueRef, function(data, progress, resolve, reject) {
    var message = new gcm.Message();

    // Read and process task data
    console.log(data);

    var type = data.type;
    var content = data.content;
    var consultationId = data.consultationId;

    message.addData('type', type);
    message.addData('consultationId', consultationId);

    if (type = 'new-consultation') {
        message.addData('title', 'Nueva consulta médica');
        message.addData('message', content);

        sender.sendNoRetry(message, { topic: '/topics/medic' }, function (err, response) {
        	if(err) {
                console.error(err);
            } else {
                console.log(response);

                resolve();
            }
        });
    } else if (type = 'consultation-approved') {
        message.addData('title', 'Consulta aprovada');
        message.addData('message', content);

        var patientId = data.patientId;

        // Retrieve GCM Token
        ref.child(patientId).once("gcmRegisterId", function(data) {
            var registrationTokens = [];
            registrationTokens.push(data);

            // Send notification for that Patient
            sender.sendNoRetry(message, { registrationTokens: registrationTokens }, function (err, response) {
                if(err) {
                    console.error(err);
                } else {
                    console.log(response);

                    resolve();
                }
            });
        });
    }
});
