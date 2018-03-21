import { Item } from './item';

export interface List {
    id: string;
    creatorId: string;
    name: string;
    items: Item[];
}