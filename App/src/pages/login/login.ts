import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, AlertController } from 'ionic-angular';
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

    constructor(private nav: NavController, formBuilder: FormBuilder, private loadingDialog: LoadingDialog, private store: SiteStore, private userService: FirestoreUserService, private alertCtrl: AlertController, private authService: FirestoreAuthService, private storage: Storage) {
        this.loginForm = formBuilder.group({
            email: ['', Validators.compose([Validators.required, Validators.email])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
        });
    }

    private login() {
        this.loading = true;

        this.authService.signIn(this.loginForm.value.email, this.loginForm.value.password)
            .then(response => { console.log("sign in response", response); return this.userService.getUserById(response.uid); })
            .then((user: User) => {
                return this.loginUser(user);
            })
            .catch(error => {
                console.log(error);
                let message = JSON.stringify(error);
                if (error.code === FirestoreError.UnknownUser || error.code === FirestoreError.WrongPassword) message = "Invalid username or password";

                this.loading = false;
                this.loadingDialog.dismiss();
                this.loadingDialog.present(message, { spinner: "hide", enableBackdropDismiss: true });
            });
    }

    private loginWithGoogle() {
        console.log("signing in with googlez");

        this.authService.signInWithGoogle()
            .then(gplusUser => {
                console.log("returned user", gplusUser)
                // check if user in OUR firebase
                return this.userService.getUserById(gplusUser.user.uid).then((user: User) => {
                    if (user)
                        return this.loginUser(user);
                    
                    // does not exist
                    console.log("Unable to find user in firestore", gplusUser)
                    return this.userService.createUser(gplusUser.user.uid, gplusUser.user.email, gplusUser.user.displayName)
                    .then(() => {
                        return this.userService.getUserById(gplusUser.user.uid).then((user: User) => {
                        console.log("fetched user", user)
                        return this.loginUser(user);                    
                        })
                    });
                })
            })
            .catch(error => this.loadingDialog.present(`Error: ${JSON.stringify(error)}`, { spinner: "hide", enableBackdropDismiss: true }));
    }

    private resetPassword() {
        // TODO: show popup with input (default to what they entered in login)
        const nameEditAlert = this.alertCtrl.create({
            title: 'Enter email',
            inputs: [{
                type: "text",
                value: this.loginForm.value.email,
                name: "email"
            }],
            buttons: [
                'Cancel',
                {
                    text: 'Save',
                    handler: data => {
                        try
                        {
                            this.authService.resetPassword(data.email)
                            .then(() => this.loadingDialog.present('Password reset email sent', { spinner: "hide", enableBackdropDismiss: true }))
                        } catch (error) {
                            console.log(error);
                            this.loadingDialog.present('Email provided was not valid', { spinner: "hide", enableBackdropDismiss: true })
                        }
                    }
                }],
        });

        nameEditAlert.present();

    }

    private loginUser(user: User) : Promise<void> {
        this.loading = false;
        this.store.setUser(user);
        return this.storage.set(StorageKey.UserId, user.id).then(() => this.nav.setRoot(DashBoardPage));    
    }

    private handleRegisterClick(e) {
        e.preventDefault();
        this.nav.push(RegisterPage, { ...this.loginForm.value });
    }
}
