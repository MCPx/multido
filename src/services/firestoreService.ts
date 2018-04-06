import { List } from "../models/list";
import { Item } from "../models/item";
import { User } from "../models/user";
import { AngularFirestore } from "angularfire2/firestore";
import { DocumentReference, DocumentSnapshot } from "@firebase/firestore-types";
import { Injectable } from "@angular/core";
import { AngularFireAuth } from 'angularfire2/auth';

interface IFirestoreService {
    getUserById(id: string): Promise<User>;

    signIn(email: string, password: string): void;
    register(email: string, name: string, password: string): Promise<any>;
    signOut(): Promise<any>;

    getListsForUser(user: User): Promise<List[]>;
    addListForUser(user: User, name: string): void;
    removeListForUser(user: User, listToRemove: List): Promise<void>;

    updateList(list: List);
    getUpdatedList(list: List);
}

@Injectable()
export class FirestoreService implements IFirestoreService {

    constructor(private angularFirestore: AngularFirestore, private angularFireAuth: AngularFireAuth) {
    }

    public signIn(email: string, password: string): Promise<any> {
        return this.angularFireAuth.auth.signInWithEmailAndPassword(email, password);
    }

    public signOut(): Promise<any> {
        return this.angularFireAuth.auth.signOut();
    }

    public register(email: string, name: string, password: string): Promise<any> {
        return this.angularFireAuth.auth.createUserWithEmailAndPassword(email, password).then(response => {
            this.angularFirestore.collection('users').doc(response.uid).set({ name, listIds: [] });

            return response;
        });
    }

    public getUserById(id: string): Promise<User> {

        let document = this.angularFirestore.collection('users').doc(id);

        return document.ref.get().then(documentSnapshot => {
            const id = documentSnapshot.id;
            const userData = documentSnapshot.data();

            return <User>{ id, userRef: document.ref, name: userData.name, listIds: userData.listIds };

        }).catch(error => {
            console.error("Error fetching user", error);
            return Promise.reject(error);
        });
    }

    public getListsForUser(user: User): Promise<List[]> {

        const promises = user.listIds.map((documentReference: DocumentReference) => documentReference.get());

        return Promise.all(promises).then(documentSnapshots => {
            const lists = documentSnapshots.map(this.mapList);
            return lists;
        });
    }

    public addListForUser(user: User, name: string) : Promise<List> {

        return this.angularFirestore.collection("lists").add({ creatorId: user.userRef, name, items: [] }).then((docRef : DocumentReference) => {
            user.listIds.push(docRef);
            this.angularFirestore.collection("users").doc(user.id).update({ listIds: user.listIds });

            return docRef.get().then(snapshot => this.mapList(snapshot));
        });
    }

    public removeListForUser(user: User, listToRemove: List): Promise<void> {

        user.listIds = user.listIds.filter(list => list.id != listToRemove.id);

        return this.angularFirestore.collection("users").doc(user.id).update({ listIds: user.listIds });
    }

    public updateList(list: List): Promise<void> {
        if (!list.listRef) return Promise.resolve();

        return list.listRef.update({
            name: list.name,
            items: list.items
        });
    }

    public getUpdatedList(list: List): Promise<List> {
        return list.listRef.get().then(this.mapList);
    }

    private mapList(documentSnapshot : DocumentSnapshot): List {
        const listData = documentSnapshot.data();
        const id = documentSnapshot.id;
        return { id, name: listData.name, creatorId: listData.creatorId, items: listData.items.map(mapItem), listRef: documentSnapshot.ref };
    }
}

const mapItem = (item: any): Item => {
    return {
        id: item.id,
        text: item.text,
        state: { checked: item.state ? item.state.checked : false }
    };
}