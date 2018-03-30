import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SiteStore } from '../../services/siteStore';
import { DashBoardPage } from '../dashboard/dashboard'
import { FirestoreService } from '../../services/firestoreService';
import { User } from '../../models/user';
import { storageKey } from '../../enums/storageKeys';
import { LoadingDialog } from '../components/loadingdialog';
import { Storage } from '@ionic/storage';
import { firestoreError } from '../../enums/firestoreError';

interface LoginModel {
    email: string;
    password: string;
}

@Component({selector: 'page-login', templateUrl: 'login.html'})
export class LoginPage {

    loginModel: LoginModel = { email: undefined, password: undefined };

    constructor(private nav: NavController, private loadingDialog: LoadingDialog, private store: SiteStore, private firestoreService: FirestoreService, private storage: Storage) {           
    }

    public login()
    {
        if (!this.loginModel.email) return;
        
        this.loadingDialog.present("Logging you in...");

        this.firestoreService.signIn(this.loginModel.email, this.loginModel.password)
            .then(response => {
                this.firestoreService.getUserById(response.uid, (user: User) => {
                    this.loadingDialog.dismiss();
                    this.store.setUser(user);
                    this.saveUser(user);
                    this.nav.push(DashBoardPage);
                });
            }).catch(error => {
                let message = "Unable to log you in";
                if (error.code === firestoreError.unknownUser || error.code === firestoreError.wrongPassword) message = "Invalid username or password";
                
                this.loadingDialog.dismiss();
                this.loadingDialog.present(message, { spinner: "hide", enableBackdropDismiss: true });
            });
    }

    private saveUser({id, name} : User)
    {
        this.storage.set(storageKey.UserId, id);
    }
}