var Queue = require('firebase-queue');
var Firebase = require('firebase');
var gcm = require('node-gcm');

// Set up the sender with you API key
var sender = new gcm.Sender('AIzaSyC6-cOT27aMoxhl-YDkZGJpdnU1cwanawg');

var queueRef = new Firebase('https://medicapp.firebaseio.com/queue');

var queue = new Queue(queueRef, function(data, progress, resolve, reject) {
    // Read and process task data
    console.log(data);

    var type = data.type;
    var consultationId = data.consultationId;
    var topic = data.topic;

    var message = new gcm.Message();
    message.addData('title', 'un titulo');
    message.addData('message', 'un mensaje');
    message.addData('type', type);
    message.addData('consultationId', consultationId);

    sender.sendNoRetry(message, { topic: '/topics/global' }, function (err, response) {
    	if(err) {
            console.error(err);
        } else {
            console.log(response);

            resolve();
        }
    });
});
