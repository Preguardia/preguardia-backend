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
    var content = data.message;
    var consultationId = data.consultationId;
    var topic = data.topic;

    var message = new gcm.Message();

    message.addData('type', type);
    message.addData('consultationId', consultationId);

    if (type = "new-consultation") {
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
    }
});
