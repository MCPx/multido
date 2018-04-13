import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection } from "angularfire2/firestore";
import { AngularFireAuth } from 'angularfire2/auth';
import { DocumentReference, DocumentSnapshot } from "@firebase/firestore-types";
import { List } from "models/list";
import { Item } from "models/item";
import { User } from "models/user";
import { FirestoreCollection } from "enums/firestoreCollection";
import { FirestoreUserService } from "services/firestoreUserService";
import 'rxjs/add/operator/first';

@Injectable()
export class FirestoreListService {

    users: AngularFirestoreCollection<{}>;
    lists: AngularFirestoreCollection<{}>;

    constructor(private angularFirestore: AngularFirestore, private angularFireAuth: AngularFireAuth, private userService: FirestoreUserService) {
        this.users = this.angularFirestore.collection(FirestoreCollection.Users);
        this.lists = this.angularFirestore.collection(FirestoreCollection.Lists);
    }

    public addUsersToList(list: List, user: User, emails: string[]): Promise<void[]> {
        return Promise.all(emails.map(email => this.addUserToList(list, user, email)));
    }

    public addUserToList(list: List, user: User, email: string): Promise<void> {
        return this.userService.getUserByEmail(email).then((userToAdd: User) => {

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
        return this.userService.getUserByEmail(email).then((userToRemove: User) => {

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

    public getListsForUser(user: User): Promise<List[]> {

        if (!user.listIds) return Promise.resolve([]);

        const promises = user.listIds.map((documentReference: DocumentReference) => documentReference.get());

        return Promise.all(promises).then(documentSnapshots => documentSnapshots.map(this.mapList));
    }

    public addListForUser(user: User, name: string): Promise<List> {

        return this.lists.add({
            creatorId: user.userRef,
            name,
            items: [],
            userIds: [user.userRef]
        }).then((docRef: DocumentReference) => {
            user.listIds.push(docRef);
            this.users.doc(user.id).update({ listIds: user.listIds });

            return docRef.get().then(snapshot => this.mapList(snapshot));
        });
    }

    public removeListForCurrentUser(user: User, listToRemove: List): Promise<void> {

        user.listIds = user.listIds.filter(list => list.id != listToRemove.id);

        return this.users.doc(user.id).update({ listIds: user.listIds });
    }

    public updateList(list: List): Promise<void> {
        if (!list.listRef) return Promise.resolve();

        return list.listRef.update({
            name: list.name,
            items: list.items.map(item => {
                return { id: item.id, text: item.text, state: item.state }
            })
        });
    }

    public getUpdatedList(list: List): Promise<List> {
        return list.listRef.get().then(this.mapList);
    }

    private mapList(documentSnapshot: DocumentSnapshot): List {
        const listData = documentSnapshot.data();
        const id = documentSnapshot.id;
        return {
            id,
            name: listData.name,
            creatorId: listData.creatorId,
            items: listData.items.map(item => new Item(item)),
            listRef: documentSnapshot.ref,
            userIds: listData.userIds || []
        };
    }
}

