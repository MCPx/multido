import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SiteStore } from '../../services/siteStore';

@Component({selector: 'page-dashboard', templateUrl: 'dashboard.html'})
export class DashBoardPage {
    constructor(private nav: NavController, private store: SiteStore){

    }
}