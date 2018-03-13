import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SiteStore } from '../../services/siteStore';
import { FirestoreService } from '../../services/firestoreService';
import { List } from '../../models/list';
import { ListPage } from '../list/list';

@Component({selector: 'page-dashboard', templateUrl: 'dashboard.html'})
export class DashBoardPage {

    lists: List[];

    constructor(private nav : NavController, private store : SiteStore, private firestoreService : FirestoreService)
    {
        this.firestoreService.getListsForUser(this.store.getUser(), lists => {
            this.lists = lists;
        });        
    }

    navigateToList(list) {
        this.nav.push(ListPage, { list });
    }

    getListSubtext(numItems) {
        return numItems + " item" + (numItems > 1 ? "s": "");
    };

    handleAddListClick()
    {
        console.log("Add list FAB pressed");
    }
}