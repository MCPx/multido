import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, NavParams } from '@ionic/angular';
import { FirestoreListService } from 'services/firestoreList.service';
import { SiteStore } from 'services/siteStore';
import { List } from 'models/list';
import { Item } from 'models/item';
import { uuid } from 'util/utility';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'app-list',
    templateUrl: 'list.page.html',
    styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {

    list: List;
    checkedItems: Item[];
    uncheckedItems: Item[];
    isUpdating = false;
    newItemName: string;
    debounceUpdate: Subject<void> = new Subject();

    constructor(
        private navParams: NavParams,
        private listService: FirestoreListService,
        private store: SiteStore,
        private router: Router,
        private alertCtrl: AlertController,
        private actionSheetCtrl: ActionSheetController) {

        this.list = this.navParams.get('list');
        this.checkedItems = this.list.items.filter(x => x.state.checked);
        this.uncheckedItems = this.list.items.filter(x => !x.state.checked);
    }

    ngOnInit() {
        // adding list to firestore is triggered from DashboardPage - merge response with local when it completes
        const addListPromise = this.navParams.get('addListPromise');
        if (addListPromise) {
            addListPromise.then(addedList => {
                const items = this.list.items.concat(addedList.items);
                this.list = addedList;
                this.list.items = items;

                this.checkedItems = this.list.items.filter(x => x.state.checked);
                this.uncheckedItems = this.list.items.filter(x => !x.state.checked);

                this.debounceUpdate.next();
            });
        }

        this.debounceUpdate
            .pipe(debounceTime(500))
            .subscribe({ next: () => this.updateList() });
    }

    ionViewWillEnter() {
        this.debounceUpdate.next();
    }

    ionViewWillLeave() {
        this.updateList();
    }

    // reorder on check
    private handleItemCheck(item: Item) {
        this.sort(item);
    }

    private sort(item: Item) {
        this.uncheckedItems = this.list.items.filter(x => !x.state.checked);
        this.checkedItems = this.list.items.filter(x => x.state.checked);

        this.list.items = this.uncheckedItems.concat(this.checkedItems);

        this.debounceUpdate.next();
    }

    private onBlur() {
        if (this.newItemName) {
            const newItem = new Item({ id: uuid(), state: { checked: false }, text: this.newItemName });
            this.list.items.push(newItem);
            this.sort(newItem);
            this.newItemName = null;
        }
    }

    async handleManageListClick() {
        return this.router.navigate(['/manageList'], { queryParams: {
            knownUserEmails: this.store.getUser().knownUserEmails,
            list: this.list
        }});
    }

    async presentActionSheet(item: Item) {
        const actionSheet = await this.actionSheetCtrl.create({
            header: 'Edit item',
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
                    }
                }
            ]
        });
        return actionSheet.present();
    }

    private deleteItem(item: Item) {
        this.list.items = this.list.items.filter(i => i !== item);
        this.debounceUpdate.next();
    }

    private updateItem(item: Item, value: string) {
        if (item.text === value) {
            return;
        }

        item.text = value;
        this.debounceUpdate.next();
    }

    async updateList() {
        this.isUpdating = true;
        await this.listService.updateList(this.list);
        this.isUpdating = false;
    }

    private refreshList(e) {
        this.listService.getUpdatedList(this.list)
            .then(list => {
                this.list = list;
            }).then(() => e.complete());
    }

    async handleListNameClick() {
        const nameEditAlert = await this.alertCtrl.create({
            header: 'Edit name',
            inputs: [{
                type: 'text',
                value: this.list.name,
                name: 'name'
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

        return nameEditAlert.present();
    }
}
