import { Item } from './item';
import { DocumentReference } from '@firebase/firestore-types';

export class List {
    id: string;
    imageId: string;
    imageData: string;
    creatorId: string;
    userIds: DocumentReference[];
    name: string;
    items: Item[];
    listRef: DocumentReference;

    constructor({id, imageId, creatorId, userIds, name, items, listRef}: List) {
        this.id = id;
        this.imageId = imageId;
        this.creatorId = creatorId;
        this.userIds = userIds;
        this.name = name;
        this.items = items;
        this.listRef = listRef;
    }
}
