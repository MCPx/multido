import { Component } from '@angular/core';
import { AlertController, ModalController, NavController } from 'ionic-angular';
import { SiteStore } from 'services/siteStore';
import { FirestoreListService } from 'services/firestoreListService';
import { List } from 'models/list';
import { Item } from 'models/item';
import { ListPage } from 'pages/list/list';
import { ManageListPage } from 'pages/manageList/manageList';

@Component({ selector: 'page-dashboard', templateUrl: 'dashboard.html' })
export class DashBoardPage {

    lists: List[];
    isLoading: boolean;

    constructor(private nav: NavController, private alertCtrl: AlertController, private store: SiteStore, private listService: FirestoreListService) {
    }

    ionViewWillEnter() {
        this.loadLists();
    }

    private loadLists() {
        this.isLoading = true;
        return this.listService.getListsForUser(this.store.getUser()).then(lists => {
            this.lists = lists;
            this.isLoading = false;
        });
    }

    private async handleListClick(list: List) {
        return this.nav.push(ListPage, { list });
    }

    private getListSubtext(items: Item[] = []) {
        return items.length + " item" + (items.length == 1 ? "" : "s");
    };

    private handleAddListClick() {
        const addListAlert = this.alertCtrl.create({
            title: 'Add',
            inputs: [{
                type: "text",
                name: "name"
            }],
            buttons: [
                'Cancel',
                {
                    text: 'Save',
                    handler: data => {
                        const newList = <List>{ name: data.name, items: [] };

                        this.lists.push(newList); // add list locally, should be updated with properties when getLists is called
                        const addListPromise = this.listService.addListForUser(this.store.getUser(), newList.name);
                        this.nav.push(ListPage, { list: newList, addListPromise });
                    }
                }],
        });

        addListAlert.present();
    }

    // update lists locally, then on firestore
    private handleDeleteClick(e, listToRemove) {
        const deleteConfirm = this.alertCtrl.create({
            title: 'Remove yourself from this list?',
            buttons: [
                'Cancel',
                {
                    text: 'Remove me',
                    handler: () => this.removeList(listToRemove)
                }],
        });

        deleteConfirm.present();

        e.stopPropagation(); // don't trigger click on surrounding card
    }

    private removeList(listToRemove) {
        this.isLoading = true;
        this.lists = this.lists.filter(list => list.id != listToRemove.id);
        this.listService.removeListForCurrentUser(this.store.getUser(), listToRemove)
            .then(() => this.loadLists())
            .catch(error => { this.lists.push(listToRemove); this.isLoading = false; });
    }

    private handleDashboardRefresh(e) {
        this.loadLists().then(() => e.complete());
    }

    private handleListImageClick(e, list: List) {
        console.log("image click!", e, list);
        e.stopPropagation(); // don't trigger click on surrounding card
    }

    handleLongPress(listToEdit: List) {
        this.displayManagePage(listToEdit);
    }

    private displayManagePage(list: List) {
        this.nav.push(ManageListPage, { knownUserEmails: this.store.getUser().knownUserEmails, list });
    }
}
