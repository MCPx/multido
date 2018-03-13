import { Component } from '@angular/core';
import { NavController, LoadingController, Loading } from 'ionic-angular';
import { SiteStore } from '../../services/siteStore';
import { DashBoardPage } from '../dashboard/dashboard'
import { FirestoreService } from '../../services/firestoreService';
import { User } from '../../models/user';
import { ListPage } from '../list/list';
import { List } from '../../models/list';


interface LoginModel {
    username: string;
}

@Component({selector: 'page-login', templateUrl: 'login.html'})
export class LoginPage {

    loadingDialog: Loading;

    constructor(private nav: NavController, private loadingCtrl: LoadingController, private store: SiteStore, private firestoreService: FirestoreService) {
       
        this.createLoadingDialog();        
    }

    loginModel: LoginModel = { username: null};

    public login()
    {
        if (!this.loginModel.username) return;

		console.log("Logging in", this.loginModel.username);
        
        this.loadingDialog.present();

        this.firestoreService.getUserByName(this.loginModel.username, (user: User) => {
            this.loadingDialog.dismiss();
            this.store.setUser(user);
            this.nav.push(DashBoardPage);
            // this.nav.push(ListPage, { list: <List> { Name: "Groceries", Items: [{ Text: "Black bags", State: { checked: false }}] } });
        });
    }

    createLoadingDialog() {
        this.loadingDialog = this.loadingCtrl.create({
            content: 'Logging you in...'
        });
    }


}