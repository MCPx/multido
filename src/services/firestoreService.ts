import { List } from "../models/list";
import { Item } from "../models/item";
import { User } from "../models/user";
import { AngularFirestore } from "angularfire2/firestore";
import { DocumentReference, DocumentSnapshot } from "@firebase/firestore-types";
import { Injectable } from "@angular/core";

interface IFirestoreService {
    getUserByName(username: string, callback:(user: User) => void) : void;

    getListsForUser(user: User, callback:(lists: List[]) => void) : void;
}

@Injectable()
export class FirestoreService implements IFirestoreService {

    
    constructor(private angularFirestore : AngularFirestore) {
    }

    getUserByName(username: string, callback: Function): void 
    {
        console.log("Fetching user: ", username);
        let query = this.angularFirestore.collection('users').ref.where("name", "==", username);
   
        query.get().then(querySnapshot => {
            const userDoc = querySnapshot.docs[0];
            const Id = userDoc.id;
            const userData = userDoc.data();

            callback({Id, Name: userData.name, ListIds: userData.listIds});
            
        }).catch((error) => console.error("Error fetching user", error));
    }

    getListsForUser(user: User, callback:(lists: List[]) => void): void {
        console.log("Fetching lists for user: ", user);
        const promises = user.ListIds.map((documentReference: DocumentReference) => {
            return documentReference.get();  
        });

        Promise.all(promises).then(documentSnapshots => 
        { 
            const lists = documentSnapshots.map(this.mapList);
            callback(lists);
        });
    }

    private mapList(documentSnapshot: DocumentSnapshot ) : List
    {
        const listData = documentSnapshot.data();
        const Id = documentSnapshot.id;
        return { Id, Name: listData.name, CreatorId: listData.creatorId, Items: listData.items.map(mapItem)};         
    }

    
}

const mapItem = (item: any) : Item =>
{
    return {
        Id: item.id,
        Text: item.text,
        State: { checked: item.state ? item.state.checked : false }
    };
}