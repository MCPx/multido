import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SiteStore } from '../../services/siteStore';
import { DashBoardPage } from '../dashboard/dashboard'
import { FirestoreService } from '../../services/firestoreService';
import { User } from '../../models/user';
import { LoadingDialog } from '../components/loadingdialog';


interface LoginModel {
    email: string;
    password: string;
}

@Component({selector: 'page-login', templateUrl: 'login.html'})
export class LoginPage {

    loginModel: LoginModel = { email: "marcelcprinsloo@gmail.com", password: "password" };

    constructor(private nav: NavController, private loadingDialog: LoadingDialog, private store: SiteStore, private firestoreService: FirestoreService) {           
    }

    public login()
    {
        if (!this.loginModel.email) return;

		console.log("Logging in", this.loginModel.email);
        
        this.loadingDialog.present("Logging you in...");

        this.firestoreService.signIn(this.loginModel.email, this.loginModel.password)
            .then(response => {
                console.log("login response", response);
                this.firestoreService.getUserById(response.uid, (user: User) => {
                    this.loadingDialog.dismiss();
                    this.store.setUser(user);
                    this.nav.push(DashBoardPage);
                });
            }).catch(error => {
                this.loadingDialog.dismiss();
                this.loadingDialog.present("Unable to log you in.", { enableBackdropDismiss: true });
            });
    }
}