import { DocumentReference } from "@firebase/firestore-types";

export interface User
{
    id: string;
    name: string;
    listIds: DocumentReference[];
}