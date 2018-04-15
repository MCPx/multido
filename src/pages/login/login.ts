import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SiteStore } from 'services/siteStore';
import { FirestoreUserService } from "services/firestoreUserService";
import { FirestoreAuthService } from "services/firestoreAuthService";
import { DashBoardPage } from 'pages/dashboard/dashboard'
import { LoadingDialog } from 'pages/components/loadingdialog';
import { RegisterPage } from 'pages/register/register';
import { User } from 'models/user';
import { StorageKey } from 'enums/storageKey';
import { FirestoreError } from 'enums/firestoreError';

@Component({ selector: 'page-login', templateUrl: 'login.html' })
export class LoginPage {

    loginForm: FormGroup;
    showPasswordText: boolean = false;
    loading: boolean = false;

    constructor(private nav: NavController, formBuilder: FormBuilder, private loadingDialog: LoadingDialog, private store: SiteStore, private userService: FirestoreUserService, private authService: FirestoreAuthService, private storage: Storage) {
        this.loginForm = formBuilder.group({
            email: ['', Validators.compose([Validators.required, Validators.email])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
        });
    }

    private login() {
        this.loading = true;

        this.authService.signIn(this.loginForm.value.email, this.loginForm.value.password)
            .then(response => {
                this.userService.getUserById(response.uid).then((user: User) => {
                    this.loading = false;
                    this.store.setUser(user);
                    return this.storage.set(StorageKey.UserId, user.id)
                        .then(value => this.nav.setRoot(DashBoardPage));
                });
            }).catch(error => {
            let message = "Unable to log you in";
            if (error.code === FirestoreError.UnknownUser || error.code === FirestoreError.WrongPassword) message = "Invalid username or password";

            this.loading = false;
            this.loadingDialog.dismiss();
            this.loadingDialog.present(message, { spinner: "hide", enableBackdropDismiss: true });
        });
    }

    private handleRegisterClick(e) {
        e.preventDefault();
        this.nav.push(RegisterPage, { ...this.loginForm.value });
    }
}
