import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SiteStore } from '../../services/siteStore';
import { DashBoardPage } from '../dashboard/dashboard'


interface LoginModel {
    username: string;
}

@Component({selector: 'page-login', templateUrl: 'login.html'})
export class LoginPage {
    constructor(private nav: NavController, private store: SiteStore){

    }

    loginModel: LoginModel = { username: null};

    public login()
    {
        if (!this.loginModel.username) return;

		console.log("Logging in", this.loginModel.username);
		this.store.setUserName(this.loginModel.username);
		this.nav.push(DashBoardPage);
    }

}