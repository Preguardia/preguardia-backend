var Queue = require('firebase-queue');
var Firebase = require('firebase');
var gcm = require('node-gcm');

const FIREBASE_URL = 'https://medicapp.firebaseio.com';
const FIREBASE_USERS = 'users';
const FIREBASE_QUEUE = 'queue';
const FIREBASE_USER_REGISTER_ID = 'gcmRegisterId';

const FIREBASE_TASK_CONSULTATION_CREATED = 'new-consultation';
const FIREBASE_TASK_CONSULTATION_APPROVED = 'consultation-approved';
const FIREBASE_TASK_CONSULTATION_CLOSED = 'consultation-closed';
const FIREBASE_TASK_MESSAGE_NEW = 'message-new';

const FIREBASE_CONSULTATION_ID = 'consultationId';

const GCM_SENDER_ID = 'AIzaSyC6-cOT27aMoxhl-YDkZGJpdnU1cwanawg';
const GCM_TOPIC_MEDIC = '/topics/medic';

const GCM_NOTIFICATION_TYPE = 'type';
const GCM_NOTIFICATION_TITLE = 'title';
const GCM_NOTIFICATION_MESSAGE = 'message';

var sender = new gcm.Sender(GCM_SENDER_ID);

var queueRef = new Firebase(FIREBASE_URL + '/' + FIREBASE_QUEUE);
var usersRef = new Firebase(FIREBASE_URL + '/' + FIREBASE_USERS);

var queue = new Queue(queueRef, function (data, progress, resolve, reject) {
    var message = new gcm.Message();

    // Read task content
    var type = data.type;
    var content = data.content;
    var consultationId = data.consultationId;
    var patientId = data.patientId;
    var userId = data.userId;
    var medicName = "Juan Benitez";

    // Handle each type of Task
    switch (type) {

        case FIREBASE_TASK_CONSULTATION_CREATED:
            console.log("> Consultation Created");

            message.addData(GCM_NOTIFICATION_TYPE, type);
            message.addData(GCM_NOTIFICATION_TITLE, 'Nueva consulta médica');
            message.addData(GCM_NOTIFICATION_MESSAGE, content);
            message.addData(FIREBASE_CONSULTATION_ID, consultationId);

            sender.sendNoRetry(message, {topic: GCM_TOPIC_MEDIC}, function (err, response) {
                if (err) {
                    console.error("< New Consultation - Notification not sent - Error: " + err);
                } else {
                    console.log("< New Consultation - Notification sent - Response: " + response);

                    resolve();
                }
            });

            break;

        case FIREBASE_TASK_CONSULTATION_APPROVED:
            console.log("> Consultation Approved");

            message.addData(GCM_NOTIFICATION_TYPE, type);
            message.addData(GCM_NOTIFICATION_TITLE, 'Consulta aprobada');
            message.addData(GCM_NOTIFICATION_MESSAGE, content);
            message.addData(FIREBASE_CONSULTATION_ID, consultationId);

            // Retrieve GCM Token
            usersRef.child(patientId).child(FIREBASE_USER_REGISTER_ID).once("value", function (data) {
                var registerId = data.val();
                var registrationTokens = [];

                console.log("- User regId found: " + registerId);

                // Add Register ID
                registrationTokens.push(registerId);

                // Send notification for that Patient
                sender.sendNoRetry(message, {registrationTokens: registrationTokens}, function (err, response) {
                    if (err) {
                        console.error("< Consultation Approved - Notification not sent - Error: " + err);
                    } else {
                        console.log("< Consultation Approved - Notification sent - Response: " + response);

                        resolve();
                    }
                });
            });

            break;

        case FIREBASE_TASK_CONSULTATION_CLOSED:
            console.log("> Consultation Closed");

            message.addData(GCM_NOTIFICATION_TYPE, type);
            message.addData(GCM_NOTIFICATION_TITLE, 'Consulta cerrada');
            message.addData(GCM_NOTIFICATION_MESSAGE, medicName + ' cerró la consulta médica');
            message.addData(FIREBASE_CONSULTATION_ID, consultationId);

            // Retrieve GCM Token for User
            usersRef.child(userId).child(FIREBASE_USER_REGISTER_ID).once("value", function (data) {
                var registerId = data.val();
                var registrationTokens = [];

                console.log("- User regId found: " + registerId);

                // Add Register ID
                registrationTokens.push(registerId);

                // Send notification for that Patient
                sender.sendNoRetry(message, {registrationTokens: registrationTokens}, function (err, response) {
                    if (err) {
                        console.error("< Consultation Closed - Notification not sent - Error: " + err);
                    } else {
                        console.log("< Consultation Closed - Notification sent - Response: " + response);

                        resolve();
                    }
                });
            });

            break;

        case FIREBASE_TASK_MESSAGE_NEW:
            console.log("> New Message");

            message.addData(GCM_NOTIFICATION_TYPE, type);
            message.addData(GCM_NOTIFICATION_TITLE, 'Nuevo mensaje');
            message.addData(GCM_NOTIFICATION_MESSAGE, content);
            message.addData(FIREBASE_CONSULTATION_ID, consultationId);

            // Retrieve GCM Token for User
            usersRef.child(userId).child(FIREBASE_USER_REGISTER_ID).once("value", function (data) {
                var registerId = data.val();
                var registrationTokens = [];

                console.log("- User regId found: " + registerId);

                // Add Register ID
                registrationTokens.push(registerId);

                // Send notification for that Patient
                sender.sendNoRetry(message, {registrationTokens: registrationTokens}, function (err, response) {
                    if (err) {
                        console.error("< New Message - Notification not sent - Error: " + err);
                    } else {
                        console.log("< New Message - Notification sent - Response: " + response);

                        resolve();
                    }
                });
            });

            break;

        default:
            console.log("> Default task type");
    }
});
