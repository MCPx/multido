import { Item } from './item';
import { DocumentReference } from '@firebase/firestore-types';

export class List {
    id: string;
    creatorId: string;
    userIds: DocumentReference[];
    name: string;
    items: Item[];
    listRef: DocumentReference;

    constructor({id, creatorId, userIds, name, items, listRef}: List) {
        this.id = id;
        this.creatorId = creatorId;
        this.userIds = userIds;
        this.name = name;
        this.items = items;
        this.listRef = listRef;
    }
}