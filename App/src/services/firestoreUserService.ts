import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection } from "angularfire2/firestore";
import { QuerySnapshot } from "@firebase/firestore-types";
import { FirestoreCollection } from "enums/firestoreCollection";
import { User } from "models/user";

@Injectable()
export class FirestoreUserService {

    users: AngularFirestoreCollection<{}>;

    constructor(private angularFirestore: AngularFirestore) {
        this.users = this.angularFirestore.collection(FirestoreCollection.Users);
    }

    public getUserById(id: string): Promise<User> {

        let document = this.users.doc(id);

        return document.ref.get().then(documentSnapshot => {
            const id = documentSnapshot.id;
            const userData = documentSnapshot.data();

            if (!userData) return undefined;

            return <User>{
                id,
                userRef: document.ref,
                name: userData.name,
                listIds: userData.listIds || [],
                knownUserEmails: userData.knownUserEmails || [],
                email: userData.email
            };

        }).catch(error => {
            console.error("Error fetching user", error);
            return Promise.reject(error);
        });
    }

    public getUserByEmail(email: string): Promise<User> {
        return this.angularFirestore.firestore.collection(FirestoreCollection.Users).where('email', '==', email.toLowerCase()).get()
            .then((querySnapshot: QuerySnapshot) => {
                if (querySnapshot.empty) {
                    const message = `Unable to find user for email: ${email}`;
                    console.error(message);
                    throw new Error(message);
                } else if (querySnapshot.size > 1) {
                    const message = `Multiple users found for email: ${email}`;
                    console.error(message);
                    throw new Error(message);
                }

                const data = querySnapshot.docs[0].data();

                return <User> {
                    id: querySnapshot.docs[0].id,
                    name: data.name,
                    email: data.email,
                    listIds: data.listIds || [],
                    userRef: querySnapshot.docs[0].ref
                };
            });
    }

    public createUser(uid: string, email: string, name: string) : Promise<void>{
        console.log("Creating user ", uid, email, name);
        return this.users.doc(uid).set({ name, listIds: [], email });
    }
}
