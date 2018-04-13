import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SiteStore } from '../../services/siteStore';
import { DashBoardPage } from '../dashboard/dashboard'
import { User } from '../../models/user';
import { StorageKey } from '../../enums/storageKey';
import { LoadingDialog } from '../components/loadingdialog';
import { Storage } from '@ionic/storage';
import { FirestoreError } from '../../enums/firestoreError';
import { RegisterPage } from '../register/register';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreUserService } from "../../services/firestoreUserService";
import { FirestoreAuthService } from "../../services/firestoreAuthService";

@Component({ selector: 'page-login', templateUrl: 'login.html' })
export class LoginPage {

    loginForm: FormGroup;
    showPasswordText: boolean = false;

    constructor(private nav: NavController, formBuilder: FormBuilder, private loadingDialog: LoadingDialog, private store: SiteStore, private userService: FirestoreUserService, private authService: FirestoreAuthService, private storage: Storage) {
        this.loginForm = formBuilder.group({
            email: ['', Validators.compose([Validators.required, Validators.email])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
        });
    }

    private login() {
        this.loadingDialog.present("Logging you in...");

        this.authService.signIn(this.loginForm.value.email, this.loginForm.value.password)
            .then(response => {
                this.userService.getUserById(response.uid).then((user: User) => {
                    this.loadingDialog.dismiss();
                    this.store.setUser(user);
                    return this.storage.set(StorageKey.UserId, user.id)
                        .then(value => this.nav.setRoot(DashBoardPage));
                });
            }).catch(error => {
            let message = "Unable to log you in";
            if (error.code === FirestoreError.UnknownUser || error.code === FirestoreError.WrongPassword) message = "Invalid username or password";

            this.loadingDialog.dismiss();
            this.loadingDialog.present(message, { spinner: "hide", enableBackdropDismiss: true });
        });
    }

    private handleRegisterClick(e) {
        e.preventDefault();
        this.nav.push(RegisterPage, { ...this.loginForm.value });
    }
}
