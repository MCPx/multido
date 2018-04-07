import { DocumentReference } from "@firebase/firestore-types";

export class User
{
    id: string;
    userRef: DocumentReference;
    name: string;
    email: string;
    knownUserEmails: string[];
    listIds: DocumentReference[];
}