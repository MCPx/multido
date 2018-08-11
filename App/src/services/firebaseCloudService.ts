import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { Platform } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { User } from 'models/user';

@Injectable()
export class FirebaseCloudService {

    constructor(
        public firebaseNative: Firebase,
        public afs: AngularFirestore,
        private platform: Platform
    ) { }

    // Get permission from the user
    async generateToken(user: User) {
        let token;
        
        if (this.platform.is('android')) {
            token = await this.firebaseNative.getToken()
        } else if (this.platform.is('ios')) {
            token = await this.firebaseNative.getToken();
            await this.firebaseNative.grantPermission();
        } else return;

        console.log("Token: ", token);

        return this.saveTokenToFirestore(token, user)
    }

    // Save the token to firestore
    private saveTokenToFirestore(token, user: User) {
        if (!token) return;

        const devicesRef = this.afs.collection('devices')

        const docData = {
            token,
            userId: user.id,
        }

        return devicesRef.doc(token).set(docData)
    }

    // Listen to incoming FCM messages
    listenToNotifications() {
        return this.firebaseNative.onNotificationOpen()
     }

}
