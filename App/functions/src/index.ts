import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as _ from 'lodash';
import {
    DocumentReference,
    DocumentSnapshot,
    QueryDocumentSnapshot,
    DocumentData,
    QuerySnapshot
} from "@firebase/firestore-types";

admin.initializeApp();

/*
    When list items are modified
        notify all users except the agent

*/

// user is added to a list
exports.addedUserNotification = functions.firestore
    .document('lists/{listId}')
    .onUpdate(async event => {
            // the update is a user being added
            const beforeData = event.before.data();
            const afterData = event.after.data();

            const beforeIds = beforeData.userIds.map((docRef: DocumentReference) => docRef.id);
            const afterIds = afterData.userIds.map((docRef: DocumentReference) => docRef.id);

            const addedUsers: string[] = _.difference(afterIds, beforeIds);

            if (addedUsers.length === 0)
                return Promise.resolve(); // no users added

            const listName = afterData.name;

            return sendNotificationsToUsers(afterData.userIds, `A new person was added to list ${listName}`);
        }
    );

const sendNotificationsToUsers = (userIds: any[], title: string, body?: string) => {

    const db = admin.firestore();
    db.settings({timestampsInSnapshots: true});

    return Promise.all(userIds.map((userId: DocumentReference) => {

        const devicesRef = db.collection('devices').where('userId', '==', userId.id);

        // get the user's tokens and send notifications
        return devicesRef.get();
    })).then(devices => sendNotifications(devices, title));
};

const sendNotifications = (devices: any[], title: string, body?: string) => {
    const tokens = [];

    const payload = {
        notification: {
            title: title,
            body
        }
    };

    // send a notification to each device token
    devices.forEach(snapshot => {
        snapshot.forEach(result => {
            const token = result.data().token;

            tokens.push(token);
        })
    });

    if (tokens.length > 0)
        return admin.messaging().sendToDevice(tokens, payload);

    console.warn("No devices to notify");

    return Promise.resolve(<admin.messaging.MessagingDevicesResponse>undefined);
}
