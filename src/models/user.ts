import { DocumentReference } from "@firebase/firestore-types";

export interface User
{
    Id: string;
    Name: string;
    ListIds: DocumentReference[];
}