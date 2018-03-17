import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { SiteStore } from '../../services/siteStore';
import { FirestoreService } from '../../services/firestoreService';
import { List } from '../../models/list';
import { ListPage } from '../list/list';
import { LoadingDialog } from '../components/loadingdialog';
import { AddListPage } from '../components/addList/addList';

@Component({ selector: 'page-dashboard', templateUrl: 'dashboard.html' })
export class DashBoardPage {

    lists: List[];

    constructor(private nav: NavController, private loadingDialog: LoadingDialog, private modalController: ModalController, private store: SiteStore, private firestoreService: FirestoreService) {
        this.getLists();
    }

    navigateToList(list: List) {
        this.nav.push(ListPage, { list });
    }

    getListSubtext(numItems: number) {
        return numItems + " item" + (numItems == 1 ? "" : "s");
    };

    getLists() {
        this.loadingDialog.present("Fetching lists...");
        this.firestoreService.getListsForUser(this.store.getUser(), lists => {
            this.lists = lists;
            this.loadingDialog.dismiss();
        });
    }

    handleAddListClick() {
        const addListModal = this.modalController.create(AddListPage, {});
        addListModal.onDidDismiss(data => {
            this.firestoreService.addListForUser(this.store.getUser(), data.name).then(() => this.getLists());
        });
        
        addListModal.present();
    }
}