import { List } from "../models/list";
import { Item } from "../models/item";
import { User } from "../models/user";
import { AngularFirestore, AngularFirestoreCollection } from "angularfire2/firestore";
import { DocumentReference, DocumentSnapshot, QuerySnapshot, DocumentData } from "@firebase/firestore-types";
import { Injectable } from "@angular/core";
import { AngularFireAuth } from 'angularfire2/auth';
import 'rxjs/add/operator/first';
import { Subject } from "rxjs/Subject";
import { query } from "@angular/core/src/animation/dsl";
import { FirestoreCollection } from "../enums/firestoreCollection";

interface IFirestoreService {
    // user operations
    getUserById(id: string): Promise<User>;
    getUserByEmail(id: string): Promise<User>;
    addUserToList(list: List, user: User, email: string): Promise<void>;
    addUsersToList(list: List, user: User, emails: string[]): Promise<void[]>;
    removeListForUsers(listToRemove: List, emails: string[]): Promise<void[]>;
    removeListForUser(listToRemove: List, email: string): Promise<void>;
    
    // auth
    signIn(email: string, password: string): void;
    register(email: string, name: string, password: string): Promise<any>;
    signOut(): Promise<any>;

    // list operations
    getListsForUser(user: User): Promise<List[]>;
    addListForUser(user: User, name: string): void;
    removeListForCurrentUser(user: User, listToRemove: List): Promise<void>;
    updateList(list: List);
    getUpdatedList(list: List);
}

@Injectable()
export class FirestoreService implements IFirestoreService {

    users: AngularFirestoreCollection<{}>;
    lists: AngularFirestoreCollection<{}>;

    constructor(private angularFirestore: AngularFirestore, private angularFireAuth: AngularFireAuth) {
        this.users = this.angularFirestore.collection(FirestoreCollection.Users);
        this.lists = this.angularFirestore.collection(FirestoreCollection.Lists);
    }

    public addUsersToList(list: List, user: User, emails: string[]): Promise<void[]> {
        return Promise.all(emails.map(email => this.addUserToList(list, user, email)));
    }

    public addUserToList(list: List, user: User, email: string): Promise<void> {
        return this.getUserByEmail(email).then((userToAdd: User) => {        

                const batch = this.angularFirestore.firestore.batch();

                // add list to user's list
                userToAdd.listIds.push(list.listRef);
                batch.update(userToAdd.userRef, { listIds: userToAdd.listIds });

                // add user to list's ids
                list.userIds.push(userToAdd.userRef);
                batch.update(list.listRef, { userIds: list.userIds });

                // add added-user to users common-users                
                user.knownUserEmails.push(email);
                batch.update(user.userRef, { knownUserEmails: user.knownUserEmails });

                return batch.commit();
            });
    }

    public removeListForUsers(list: List, emails: string[]): Promise<void[]> {
        return Promise.all(emails.map(email => this.removeListForUser(list, email)));
    }

    public removeListForUser(listToRemove: List, email: string): Promise<void> {
        return this.getUserByEmail(email).then((userToRemove: User) => {   

            const batch = this.angularFirestore.firestore.batch();

            // remove list from user
            const listIds = userToRemove.listIds.filter(x => x.id !== listToRemove.id);
            batch.update(userToRemove.userRef, { listIds });

            // remove user from list
            const userIds = listToRemove.userIds.filter(x => x.id !== userToRemove.id);
            batch.update(listToRemove.listRef, { userIds });

            return batch.commit();
        });
    }


    public getUserByEmail(email: string): Promise<User> {
        return this.angularFirestore.firestore.collection(FirestoreCollection.Users).where('email', '==', email.toLowerCase()).get()
            .then((querySnapshot: QuerySnapshot) => {
                
                // add list to users listIds
                if (querySnapshot.empty) {
                    console.error("Unable to find user for email: ", email);
                    return;
                } else if (querySnapshot.size > 1) {
                    console.error("Multiple users found for email: ", email);
                    return;
                }

                var data = querySnapshot.docs[0].data();

                return <User> {
                    id: querySnapshot.docs[0].id,
                    name: data.name,
                    email: data.email,
                    listIds: data.listIds || [],
                    userRef: querySnapshot.docs[0].ref
                };
            });
    }

    public signIn(email: string, password: string): Promise<any> {
        return this.angularFireAuth.auth.signInWithEmailAndPassword(email, password);
    }

    public signOut(): Promise<any> {
        return this.angularFireAuth.auth.signOut();
    }

    public register(email: string, name: string, password: string): Promise<any> {
        return this.angularFireAuth.auth.createUserWithEmailAndPassword(email, password).then(response => {
            this.users.doc(response.uid).set({ name, listIds: [], email });

            return response;
        });
    }

    public getUserById(id: string): Promise<User> {

        let document = this.users.doc(id);

        return document.ref.get().then(documentSnapshot => {
            const id = documentSnapshot.id;
            const userData = documentSnapshot.data();

            return <User>{ id, userRef: document.ref, name: userData.name, listIds: userData.listIds || [], knownUserEmails: userData.knownUserEmails || [], email: userData.email };

        }).catch(error => {
            console.error("Error fetching user", error);
            return Promise.reject(error);
        });
    }

    public getListsForUser(user: User): Promise<List[]> {

        if (!user.listIds) return Promise.resolve([]);

        const promises = user.listIds.map((documentReference: DocumentReference) => documentReference.get());

        return Promise.all(promises).then(documentSnapshots => {
            const lists = documentSnapshots.map(this.mapList);
            return lists;
        });
    }

    public addListForUser(user: User, name: string): Promise<List> {

        return this.lists.add({ creatorId: user.userRef, name, items: [], userIds: [user.userRef] }).then((docRef: DocumentReference) => {
            user.listIds.push(docRef);
            this.users.doc(user.id).update({ listIds: user.listIds });

            return docRef.get().then(snapshot => this.mapList(snapshot));
        });
    }

    public removeListForCurrentUser(user: User, listToRemove: List): Promise<void> {

        user.listIds = user.listIds.filter(list => list.id != listToRemove.id);

        return this.users.doc(user.id).update({ listIds: user.listIds }).then(() => {
            this.lists.doc
        });
    }

    public updateList(list: List): Promise<void> {
        if (!list.listRef) return Promise.resolve();

        return list.listRef.update({
            name: list.name,
            items: list.items.map(item => { return { id: item.id, text: item.text, state: item.state } })
        });
    }

    public getUpdatedList(list: List): Promise<List> {
        return list.listRef.get().then(this.mapList);
    }

    private mapList(documentSnapshot: DocumentSnapshot): List {
        const listData = documentSnapshot.data();
        const id = documentSnapshot.id;
        return { id, name: listData.name, creatorId: listData.creatorId, items: listData.items.map(item => new Item(item)), listRef: documentSnapshot.ref, userIds: listData.userIds || [] };
    }
}

