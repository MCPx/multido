import { Component } from '@angular/core';
import { List } from '../../models/list';
import { NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { FirestoreService } from '../../services/firestoreService';
import { Item } from '../../models/item';
import { SiteStore } from '../../services/siteStore';

@Component({ selector: 'page-list', templateUrl: 'list.html' })
export class ListPage {

    list: List;
    isUpdating: boolean = false;
    newItem: string;

    constructor(private navParams: NavParams, private firestoreService: FirestoreService, private store: SiteStore, private alertCtrl: AlertController, private actionSheetCtrl: ActionSheetController) {
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
        console.log("entering", this.navParams.get('list'));
        
    }
    
    private onBlur() {
        console.log(`Triggered on blur with newItem value: '${this.newItem}'`);
        if (this.newItem) {
            this.list.items.push({ id: "newId", state: { checked: false }, text: this.newItem });
            this.newItem = null;
            this.updateList();
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

    private updateItem(item: Item, value: string) 
    {
        if (item.text === value) return;

        item.text = value;
        this.updateList();        
    }

    private updateList() {
        this.isUpdating = true;
        this.firestoreService.updateList(this.list)
            .then(() => this.isUpdating = false);
    }

    private handleListNameClick()
    {
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