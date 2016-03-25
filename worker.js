var Queue = require('firebase-queue');
var Firebase = require('firebase');
var gcm = require('node-gcm');

// Set up the sender with you API key
var sender = new gcm.Sender('AIzaSyBQu1KVXvMlmk0uqJOpAZXYfzKrwFpo8Go');

var queueRef = new Firebase('https://medicapp.firebaseio.com/queue');

var queue = new Queue(queueRef, function(data, progress, resolve, reject) {
    // Read and process task data
    console.log(data);

    // Update the progress state of the task
    // setTimeout(function() {
    //     progress(50);
    // }, 500);

    var message = new gcm.Message();
    message.addData('key1', 'msg1');

    sender.sendNoRetry(message, { topic: '/topics/global' }, function (err, response) {
    	if(err) {
            console.error(err);
        } else {
            console.log(response);

            resolve();
        }
    });

    // Finish the job asynchronously
    // setTimeout(function() {
    //     resolve();
    // }, 1000);
});
