import { DocumentReference } from "@firebase/firestore-types";

export class User
{
    id: string;
    userRef: DocumentReference;
    name: string;
    email: string;
    knownUserEmails: string[];
    listIds: DocumentReference[];

    constructor({id, userRef, name, email, knownUserEmails, listIds}: User) {
        this.id = id;
        this.userRef = userRef;
        this.name = name;
        this.email = email;
        this.knownUserEmails = knownUserEmails;
        this.listIds = listIds;
    }
}