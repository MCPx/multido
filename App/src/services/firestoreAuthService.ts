import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from 'firebase/app';
import { AngularFirestore, AngularFirestoreCollection } from "angularfire2/firestore";
import { Injectable } from "@angular/core";
import { FirestoreCollection } from "enums/firestoreCollection";
import { GooglePlus } from '@ionic-native/google-plus';
import { Platform } from 'ionic-angular';

@Injectable()
export class FirestoreAuthService {

    users: AngularFirestoreCollection<{}>;

    constructor(private angularFirestore: AngularFirestore, private angularFireAuth: AngularFireAuth, private gplus: GooglePlus, private platform: Platform) {
        this.users = this.angularFirestore.collection(FirestoreCollection.Users);
    }

    public signIn(email: string, password: string): Promise<any> {
        return this.angularFireAuth.auth.signInWithEmailAndPassword(email, password);
    }

    public signOut(): Promise<any> {
        return this.angularFireAuth.auth.signOut();
    }

    public register(email: string, name: string, password: string): Promise<any> {
        return this.angularFireAuth.auth.createUserWithEmailAndPassword(email, password);
    }    

    public signInWithGoogle() {
        if (this.platform.is('cordova')) {
            return this.nativeGoogleLogin();
          } else {
            const provider = new firebase.auth.GoogleAuthProvider();
            return this.oAuthLogin(provider);
          }
        
    }

    public resetPassword(email: string) : Promise<any> {
        return this.angularFireAuth.auth.sendPasswordResetEmail(email);
    }

    public nativeGoogleLogin(): Promise<object> {
        return this.gplus.login({
            'webClientId': '793639388905-6ggede80u9uec6aj1n1tjbdj679n121r.apps.googleusercontent.com',
            'offline': true,
            'scopes': 'email'
          }).then(gplusUser => { 
                console.log("User returned", gplusUser); 
                this.angularFireAuth.auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(gplusUser.idToken))
                return gplusUser;
            });
    } 

    private oAuthLogin(provider) {
        return this.angularFireAuth.auth.signInWithPopup(provider);
    }
}
