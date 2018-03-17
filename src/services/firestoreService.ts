import { List } from "../models/list";
import { Item } from "../models/item";
import { User } from "../models/user";
import { AngularFirestore } from "angularfire2/firestore";
import { DocumentReference, DocumentSnapshot } from "@firebase/firestore-types";
import { Injectable } from "@angular/core";
import { AngularFireAuth } from 'angularfire2/auth';

interface IFirestoreService {
    getUserById(id: string, callback:(user: User) => void) : void;

    signIn(email: string, password: string) : void
    signOut();

    getListsForUser(user: User, callback:(lists: List[]) => void) : void;
    addListForUser(user: User, name : string) : void;
}

@Injectable()
export class FirestoreService implements IFirestoreService {

    constructor(private angularFirestore : AngularFirestore, private angularFireAuth : AngularFireAuth) {
    }

    public signIn(email : string, password : string) : Promise<any> {
        return this.angularFireAuth.auth.signInWithEmailAndPassword(email, password);          
    }

    public signOut() {
        this.angularFireAuth.auth.signOut();
    }

    public getUserById(id : string, callback : (user: User) => void): void {
        console.log("Fetching user: ", id);
        let document = this.angularFirestore.collection('users').doc(id);
   
        document.ref.get().then(documentSnapshot => {
            const id = documentSnapshot.id;
            const userData = documentSnapshot.data();

            callback({id, userRef: document.ref, name: userData.name, listIds: userData.listIds});
            
        }).catch((error) => console.error("Error fetching user", error));
    }

    public getListsForUser(user : User, callback : (lists: List[]) => void) : void {
        console.log("Fetching lists for user: ", user);

        const promises = user.listIds.map((documentReference: DocumentReference) => documentReference.get());

        Promise.all(promises).then(documentSnapshots => 
        { 
            const lists = documentSnapshots.map(this.mapList);
            callback(lists);
        });
    }

    addListForUser(user: User, name: string): Promise<void> {

        return this.angularFirestore.collection("lists").add({creatorId: user.userRef, name, items: [] }).then(docRef =>
        {
            user.listIds.push(docRef);
            return this.angularFirestore.collection("users").doc(user.id).update({listIds: user.listIds});
        }).catch(error => console.error("Error adding list", error));         
    }
    

    private mapList(documentSnapshot : DocumentSnapshot ) : List
    {
        const listData = documentSnapshot.data();
        const Id = documentSnapshot.id;
        return { Id, Name: listData.name, CreatorId: listData.creatorId, Items: listData.items.map(mapItem)};         
    }    
}

const mapItem = (item : any) : Item =>
{
    return {
        Id: item.id,
        Text: item.text,
        State: { checked: item.state ? item.state.checked : false }
    };
}