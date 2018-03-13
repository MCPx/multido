import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SiteStore } from '../../services/siteStore';
import { DashBoardPage } from '../dashboard/dashboard'
import { FirestoreService } from '../../services/firestoreService';
import { User } from '../../models/user';
import { LoadingDialog } from '../../assets/components/loadingdialog';


interface LoginModel {
    username: string;
}

@Component({selector: 'page-login', templateUrl: 'login.html'})
export class LoginPage {

    loginModel: LoginModel = { username: null};

    constructor(private nav: NavController, private loadingDialog: LoadingDialog, private store: SiteStore, private firestoreService: FirestoreService) 
    {           
    }

    public login()
    {
        if (!this.loginModel.username) return;

		console.log("Logging in", this.loginModel.username);
        
        this.loadingDialog.present("Logging you in...");

        this.firestoreService.getUserByName(this.loginModel.username, (user: User) => {
            this.loadingDialog.dismiss();
            this.store.setUser(user);
            this.nav.push(DashBoardPage);
        });
    }
}