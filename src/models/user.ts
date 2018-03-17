import { DocumentReference } from "@firebase/firestore-types";

export interface User
{
    id: string;
    userRef: DocumentReference;
    name: string;
    listIds: DocumentReference[];
}