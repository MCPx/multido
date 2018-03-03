import { Item } from './item';

export interface List {
    Id: string;
    CreatorId: string;
    Name: string;
    Items: Item[];
}