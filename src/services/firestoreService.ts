import { List } from "../models/list";
import { Item } from "../models/item";
import { User } from "../models/user";
import { AngularFirestore } from "angularfire2/firestore";
import { DocumentReference, DocumentSnapshot } from "@firebase/firestore-types";
import { Injectable } from "@angular/core";
import { AngularFireAuth } from 'angularfire2/auth';

interface IFirestoreService {
    getUserById(id: string, callback: (user: User) => void): void;

    signIn(email: string, password: string): void;
    register(email: string, name: string, password: string): Promise<any>;
    signOut();

    getListsForUser(user: User, callback: (lists: List[]) => void): void;
    addListForUser(user: User, name: string): void;
    removeListForUser(user: User, listToRemove: List): Promise<void>;

    updateListItems(list: List);
}

@Injectable()
export class FirestoreService implements IFirestoreService {

    constructor(private angularFirestore: AngularFirestore, private angularFireAuth: AngularFireAuth) {
    }

    public signIn(email: string, password: string): Promise<any> {
        return this.angularFireAuth.auth.signInWithEmailAndPassword(email, password);
    }

    public signOut() {
        this.angularFireAuth.auth.signOut();
    }

    public register(email: string, name: string, password: string) : Promise<any>
    {
        return this.angularFireAuth.auth.createUserWithEmailAndPassword(email, password).then(response => {
            this.angularFirestore.collection('users').doc(response.uid).set({name, listIds: []});

            return response;
        });
    }

    public getUserById(id: string, callback: (user: User) => void): void {
        
        let document = this.angularFirestore.collection('users').doc(id);

        document.ref.get().then(documentSnapshot => {
            const id = documentSnapshot.id;
            const userData = documentSnapshot.data();

            callback({ id, userRef: document.ref, name: userData.name, listIds: userData.listIds });

        }).catch((error) => console.error("Error fetching user", error));
    }

    public getListsForUser(user: User, callback: (lists: List[]) => void): Promise<void> {
        
        const promises = user.listIds.map((documentReference: DocumentReference) => documentReference.get());

        return Promise.all(promises).then(documentSnapshots => {
            const lists = documentSnapshots.map(this.mapList);
            callback(lists);
        });
    }

    addListForUser(user: User, name: string): Promise<void> {

        return this.angularFirestore.collection("lists").add({ creatorId: user.userRef, name, items: [] }).then(docRef => {
            user.listIds.push(docRef);
            return this.angularFirestore.collection("users").doc(user.id).update({ listIds: user.listIds });
        }).catch(error => console.error("Error adding list", error));
    }

    removeListForUser(user: User, listToRemove: List): Promise<void> {

        user.listIds = user.listIds.filter(list => list.id != listToRemove.id);

        return this.angularFirestore.collection("users").doc(user.id).update({ listIds: user.listIds });
    }

    public updateListItems(list: List) : Promise<void> {
        return list.listRef.update({
            items: list.items
        })
    }

    private mapList(documentSnapshot: DocumentSnapshot): List {
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