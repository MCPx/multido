import { Component } from '@angular/core';
import { ActionSheetController, AlertController, NavController, NavParams } from 'ionic-angular';
import { FirestoreListService } from 'services/firestoreListService';
import { List } from 'models/list';
import { Item } from 'models/item';
import { uuid } from 'util/utility';
import { ManageListPage } from 'pages/manageList/manageList';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AppState } from "store/reducers";
import { Store } from "@ngrx/store";
import {getSelectedList} from "../../store/selectors/lists.selectors";
import {User} from "models/user";
import {getUser} from "../../store/selectors/user.selectors";

@Component({ selector: 'page-list', templateUrl: 'list.html' })
export class ListPage {

    user: User;
    list: List = <List>{};
    checkedItems: Item[];
    uncheckedItems: Item[];
    isUpdating: boolean = false;
    newItemName: string;
    debounceUpdate: Subject<void> = new Subject();

    constructor(private navParams: NavParams, private listService: FirestoreListService, private store: Store<AppState>, private nav: NavController, private alertCtrl: AlertController, private actionSheetCtrl: ActionSheetController) {

        this.store.select(getSelectedList).subscribe(list => {
            this.list = list || { items: [] } as List;
        });
        this.checkedItems = this.list.items.filter(x => x.state.checked);
        this.uncheckedItems = this.list.items.filter(x => !x.state.checked);

        // adding list to firestore is triggered from DashboardPage - merge response with local when it completes
        const addListPromise = this.navParams.get('addListPromise');
        if (addListPromise)
            addListPromise.then(addedList => {
                const items = this.list.items.concat(addedList.items);
                this.list = addedList;
                this.list.items = items;

                this.checkedItems = this.list.items.filter(x => x.state.checked);
                this.uncheckedItems = this.list.items.filter(x => !x.state.checked);

                this.debounceUpdate.next();
            });

        this.debounceUpdate
            .pipe(debounceTime(500))
            .subscribe({ next: () => this.updateList() });

        this.store.select(getUser).subscribe(user => this.user = user);
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

    private handleManageListClick() {
        this.nav.push(ManageListPage, {
            knownUserEmails: this.user.knownUserEmails,
            list: this.list
        });
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
                    }
                }
            ]
        });
        actionSheet.present();
    }

    private deleteItem(item: Item) {
        this.list.items = this.list.items.filter(i => i !== item);
        this.debounceUpdate.next();
    }

    private updateItem(item: Item, value: string) {
        if (item.text === value) return;

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
