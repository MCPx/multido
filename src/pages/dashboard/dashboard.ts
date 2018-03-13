import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SiteStore } from '../../services/siteStore';
import { FirestoreService } from '../../services/firestoreService';
import { List } from '../../models/list';
import { ListPage } from '../list/list';
import { LoadingDialog } from '../../assets/components/loadingdialog';

@Component({selector: 'page-dashboard', templateUrl: 'dashboard.html'})
export class DashBoardPage {

    lists: List[];
    
    constructor(private nav : NavController, private loadingDialog: LoadingDialog, private store : SiteStore, private firestoreService : FirestoreService)
    {
        loadingDialog.present("Fetching lists...");

        this.firestoreService.getListsForUser(this.store.getUser(), lists => {
            this.loadingDialog.dismiss();
            this.lists = lists;            
        });                
    }

    navigateToList(list: List) {
        this.nav.push(ListPage, { list });
    }

    getListSubtext(numItems: number) {
        return numItems + " item" + (numItems > 1 ? "s": "");
    };

    handleAddListClick()
    {
        console.log("Add list FAB pressed");
    }
}