import { Component } from '@angular/core';
import { List } from '../../models/list';
import { NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { FirestoreService } from '../../services/firestoreService';
import { Item } from '../../models/item';
import { SiteStore } from '../../services/siteStore';
import { uuid } from '../../util/utility';

@Component({ selector: 'page-list', templateUrl: 'list.html' })
export class ListPage {

    list: List;
    isUpdating: boolean = false;
    newItemName: string;

    constructor(private navParams: NavParams, private firestoreService: FirestoreService, private alertCtrl: AlertController, private actionSheetCtrl: ActionSheetController) {
        this.list = this.navParams.get('list');
        const addListPromise = this.navParams.get('addListPromise');

        // adding list to firestore is triggered from DashboardPage - merge response with local when it completes
        if (addListPromise)
            addListPromise.then(addedList => {
                const items = this.list.items.concat(addedList.items)
                this.list = addedList;
                this.list.items = items;
                this.updateList();
            });
    }

    ionViewWillEnter() {
        this.updateList();        
    }

    ionViewWillLeave() {
        console.log("leaving", this.navParams.get('list'));
        this.updateList();
    }

    // reorder on check
    private handleItemCheck(item: Item) {
        this.sort(item);
    }

    private sort(item: Item) {
        const uncheckedItems = this.list.items.filter(x => !x.state.checked && x.id !== item.id);
        const checkedItems = this.list.items.filter(x => x.state.checked && x.id !== item.id);
        
        uncheckedItems.push(item);
        this.list.items = uncheckedItems.concat(checkedItems);
        
        this.updateList();
    }

    private onBlur() {
        console.log(`Triggered on blur with newItem value: '${this.newItemName}'`);
        if (this.newItemName) {
            const newItem = <Item>{ id: uuid(), state: { checked: false }, text: this.newItemName };
            this.list.items.push(newItem);
            this.sort(newItem);
            this.newItemName = null;            
        }
    }

    private presentActionSheet(item: Item) {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Edit item',
            buttons: [
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: () => {
                        this.deleteItem(item);
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

    private deleteItem(item: Item) {
        console.log(`Deleting item: ${item.text}`);
        this.list.items = this.list.items.filter(i => i !== item);
        this.updateList();
    }

    private updateItem(item: Item, value: string) {
        if (item.text === value) return;

        item.text = value;
        this.updateList();
    }

    private updateList() {
        this.isUpdating = true;
        this.firestoreService.updateList(this.list)
            .then(() => this.isUpdating = false);
    }

    private refreshList(e) {
        this.firestoreService.getUpdatedList(this.list)
            .then(list => {
                this.list = list;
            }).then(() => e.complete());
    }

    private handleListNameClick() {
        const nameEditAlert = this.alertCtrl.create({
            title: 'Edit name',
            inputs: [{
                type: "text",
                value: this.list.name,
                name: "name"
            }],
            buttons: [
                'Cancel',
                {
                    text: 'Save',
                    handler: data => {
                        this.list.name = data.name;
                        this.firestoreService.updateList(this.list).then(() => this.isUpdating = false);
                    }
                }],
        });

        nameEditAlert.present();
    }
}