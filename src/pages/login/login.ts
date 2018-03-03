import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SiteStore } from '../../services/siteStore';
import { DashBoardPage } from '../dashboard/dashboard'
import { FirestoreService } from '../../services/firestoreService';
import { User } from '../../models/user';


interface LoginModel {
    username: string;
}

@Component({selector: 'page-login', templateUrl: 'login.html'})
export class LoginPage {
    constructor(private nav: NavController, private store: SiteStore, private firestoreService: FirestoreService){

    }

    loginModel: LoginModel = { username: null};

    public login()
    {
        if (!this.loginModel.username) return;

		console.log("Logging in", this.loginModel.username);
        
        this.firestoreService.getUserByName(this.loginModel.username, (user: User) => {
            this.store.setUser(user);
            this.nav.push(DashBoardPage);
        });


       
        

    }

}