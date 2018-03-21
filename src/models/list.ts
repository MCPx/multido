import { Item } from './item';
import { DocumentReference } from '@firebase/firestore-types';

export interface List {
    id: string;
    creatorId: string;
    name: string;
    items: Item[];
    listRef: DocumentReference
}