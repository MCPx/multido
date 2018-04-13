import { AngularFireAuth } from "angularfire2/auth";
import { FirestoreCollection } from "../enums/firestoreCollection";
import { AngularFirestore, AngularFirestoreCollection } from "angularfire2/firestore";
import { Injectable } from "@angular/core";

@Injectable()
export class FirestoreAuthService {

    users: AngularFirestoreCollection<{}>;

    constructor(private angularFirestore: AngularFirestore, private angularFireAuth: AngularFireAuth) {
        this.users = this.angularFirestore.collection(FirestoreCollection.Users);
    }

    public signIn(email: string, password: string): Promise<any> {
        return this.angularFireAuth.auth.signInWithEmailAndPassword(email, password);
    }

    public signOut(): Promise<any> {
        return this.angularFireAuth.auth.signOut();
    }

    public register(email: string, name: string, password: string): Promise<any> {
        return this.angularFireAuth.auth.createUserWithEmailAndPassword(email, password).then(response => {
            return this.users.doc(response.uid).set({ name, listIds: [], email })
                .then(response);
        });
    }
}
