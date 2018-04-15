import { Component } from '@angular/core';
import { ActionSheetController, AlertController, ModalController, NavParams } from 'ionic-angular';
import { FirestoreListService } from 'services/firestoreListService';
import { SiteStore } from 'services/siteStore';
import { List } from 'models/list';
import { Item } from 'models/item';
import { uuid } from 'util/utility';
import { ManageListPage } from 'pages/components/manageList/manageList';
import { Subject } from 'rxjs/Subject';
import "rxjs/add/operator/debounceTime";

@Component({ selector: 'page-list', templateUrl: 'list.html' })
export class ListPage {

    list: List;
    isUpdating: boolean = false;
    newItemName: string;
    debounceUpdate: Subject<void> = new Subject();

    constructor(private navParams: NavParams, private listService: FirestoreListService, private store: SiteStore, private modalCtrl: ModalController, private alertCtrl: AlertController, private actionSheetCtrl: ActionSheetController) {
        this.list = this.navParams.get('list');
        const addListPromise = this.navParams.get('addListPromise');

        // adding list to firestore is triggered from DashboardPage - merge response with local when it completes
        if (addListPromise)
            addListPromise.then(addedList => {
                const items = this.list.items.concat(addedList.items);
                this.list = addedList;
                this.list.items = items;
                this.debounceUpdate.next();
            });

        this.debounceUpdate.debounceTime(500).subscribe({ next: () => this.updateList() });
    }

    ionViewWillEnter() {
        this.debounceUpdate.next();
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

        this.debounceUpdate.next();
    }

    private onBlur() {
        console.log(`Triggered on blur with newItem value: '${this.newItemName}'`);
        if (this.newItemName) {
            const newItem = new Item({ id: uuid(), state: { checked: false }, text: this.newItemName });
            this.list.items.push(newItem);
            this.sort(newItem);
            this.newItemName = null;
        }
    }

    private handleAddPeopleClick() {
        let addPersonAlert = this.modalCtrl.create(ManageListPage, {
            knownUserEmails: this.store.getUser().knownUserEmails,
            list: this.list
        });

        addPersonAlert.present();
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
        this.debounceUpdate.next();
    }

    private updateItem(item: Item, value: string) {
        if (item.text === value) return;

        item.text = value;
        this.debounceUpdate.next();
    }

    private updateList() {
        this.isUpdating = true;
        this.listService.updateList(this.list)
            .then(() => this.isUpdating = false);
    }

    private refreshList(e) {
        this.listService.getUpdatedList(this.list)
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
                        this.listService.updateList(this.list).then(() => this.isUpdating = false);
                    }
                }],
        });

        nameEditAlert.present();
    }
}
