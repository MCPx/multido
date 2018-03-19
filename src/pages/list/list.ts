import { Component } from '@angular/core';
import { List } from '../../models/list';
import { NavParams } from 'ionic-angular';
import { FirestoreService } from '../../services/firestoreService';
import { Item } from '../../models/item';

@Component({ selector: 'page-list', templateUrl: 'list.html' })
export class ListPage {

    list : List;
    items : Item[] = [];

    newItem : string;

    constructor(private navParams : NavParams, private firestoreService : FirestoreService) {
        this.list = navParams.get('list');
        this.items = this.list.Items;
    }

    public itemCheck(itemId : string) {
        var item = this.items.find(i => i.Id == itemId);
        item.State.checked = !item.State.checked;
    }

    public onBlur() {
        console.log(`Triggered on blur with newItem value: '${this.newItem}'`);
        if (this.newItem) {
            this.items.push({ Id: "newId", State: { checked: false }, Text: this.newItem });
            this.newItem = null;
        }
    }

    public delete(item : Item) {
        console.log(`Deleting item: ${item.Text}`);
    }
}