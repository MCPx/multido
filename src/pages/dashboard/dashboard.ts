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
            // TODO: Remove when page is implemented
            this.nav.push(ListPage, { list: lists[0] });
        });
        
    }
}