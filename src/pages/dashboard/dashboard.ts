import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { SiteStore } from '../../services/siteStore';
import { FirestoreService } from '../../services/firestoreService';
import { List } from '../../models/list';
import { ListPage } from '../list/list';
import { AddListPage } from '../components/addList/addList';
import { Item } from '../../models/item';
import { AlertController } from 'ionic-angular';

@Component({ selector: 'page-dashboard', templateUrl: 'dashboard.html' })
export class DashBoardPage {

    lists: List[];
    isLoading: boolean;

    constructor(private nav: NavController, private alertCtrl : AlertController,  private modalController: ModalController, private store: SiteStore, private firestoreService: FirestoreService) {
        this.getLists();
    }

    navigateToList(list: List) {
        this.nav.push(ListPage, { list });
    }

    getListSubtext(items: Item[] = []) {
        return items.length + " item" + (items.length == 1 ? "" : "s");
    };

    getLists() {
        this.isLoading = true;
        return this.firestoreService.getListsForUser(this.store.getUser(), lists => {
            this.lists = lists;
            this.isLoading = false;
        });
    }

    handleAddListClick() {
        const addListModal = this.modalController.create(AddListPage, {});
        
        addListModal.onDidDismiss(data => {
            if (!data) return;
            
            this.isLoading = true;
            this.lists.push({name: data.name, id: "", creatorId: "", items:[]}) // add list locally, should be updated with properties when getLists is called
            this.firestoreService.addListForUser(this.store.getUser(), data.name).then(() => this.getLists());
        });
        
        addListModal.present();
    }

    // update lists locally, then on firestore
    handleDeleteClick(e, listToRemove) {

        const deleteConfirm = this.alertCtrl.create({
            title: 'Confirm Delete',
            buttons: [
                'Cancel',
                {
                    text: 'Delete',
                    handler: () => this.removeList(listToRemove)                
                }],
          });

        deleteConfirm.present();      
        
        e.stopPropagation(); // don't trigger click on surrounding card
    }

    removeList(listToRemove)
    {
        this.isLoading = true;
        this.lists = this.lists.filter(list => list.id != listToRemove.id);
        this.firestoreService.removeListForUser(this.store.getUser(), listToRemove)
            .then(() => this.getLists())
            .catch(error => { this.lists.push(listToRemove); this.isLoading=false; });
    }

    handleDashboardRefresh(e)
    {
        this.getLists().then(() => e.complete());
    }
}