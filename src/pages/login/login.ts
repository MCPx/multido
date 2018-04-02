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
import { RegisterPage } from '../register/register';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({selector: 'page-login', templateUrl: 'login.html'})
export class LoginPage {

    loginForm : FormGroup;
    showPasswordText: false;

    constructor(private nav: NavController, private formBuilder : FormBuilder, private loadingDialog: LoadingDialog, private store: SiteStore, private firestoreService: FirestoreService, private storage: Storage) {           
        this.loginForm = this.formBuilder.group({
            email: ['', Validators.compose([Validators.required, Validators.email])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
        });
    }

    private login()
    {        
        this.loadingDialog.present("Logging you in...");

        this.firestoreService.signIn(this.loginForm.value.email, this.loginForm.value.password)
            .then(response => {
                this.firestoreService.getUserById(response.uid).then((user: User) => {
                    this.loadingDialog.dismiss();
                    this.store.setUser(user);
                    this.storage.set(storageKey.UserId, user.id);
                    this.nav.setRoot(DashBoardPage);
                });
            }).catch(error => {
                let message = "Unable to log you in";
                if (error.code === firestoreError.unknownUser || error.code === firestoreError.wrongPassword) message = "Invalid username or password";
                
                this.loadingDialog.dismiss();
                this.loadingDialog.present(message, { spinner: "hide", enableBackdropDismiss: true });
            });
    }

    private handleRegisterClick(e)
    {        
        this.nav.push(RegisterPage, { ...this.loginForm.value });
        e.preventDefault();
    }
}