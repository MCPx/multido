import { Item } from './item';
import { DocumentReference } from '@firebase/firestore-types';

export interface List {
    id: string;
    creatorId: string;
    userIds: DocumentReference[];
    name: string;
    items: Item[];
    listRef: DocumentReference
}