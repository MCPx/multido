import { Component } from '@angular/core';
import { List } from '../../models/list';
import { NavParams, ActionSheetController } from 'ionic-angular';
import { FirestoreService } from '../../services/firestoreService';
import { Item } from '../../models/item';

@Component({ selector: 'page-list', templateUrl: 'list.html' })
export class ListPage {

    list: List;
    isUpdating: boolean = false;
    newItem: string;

    constructor(private navParams: NavParams, private firestoreService: FirestoreService, public actionSheetCtrl: ActionSheetController) {
        this.list = navParams.get('list');
        console.log(this.list);
    }

    public itemCheck(itemId: string) {
        var item = this.list.items.find(i => i.id == itemId);
        item.state.checked = !item.state.checked;
    }

    public onBlur() {
        console.log(`Triggered on blur with newItem value: '${this.newItem}'`);
        if (this.newItem) {
            this.list.items.push({ id: "newId", state: { checked: false }, text: this.newItem });
            this.newItem = null;
            this.isUpdating = true;
            this.firestoreService.updateListItems(this.list)
                .then(() => { this.isUpdating = false });
        }
    }

    public presentActionSheet(item : Item) {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Edit item',
            buttons: [
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: () => {
                        this.delete(item);
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    }

    public delete(item : Item) {
        console.log(`Deleting item: ${item.text}`);
    }
}