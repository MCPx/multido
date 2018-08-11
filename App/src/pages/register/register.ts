import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SiteStore } from 'services/siteStore';
import { FirestoreUserService } from "services/firestoreUserService";
import { FirestoreAuthService } from "services/firestoreAuthService";
import { DashBoardPage } from 'pages/dashboard/dashboard'
import { LoadingDialog } from 'pages/components/loadingdialog';
import { User } from 'models/user';
import { StorageKey } from 'enums/storageKey';
import { FirestoreError } from 'enums/firestoreError';

@Component({selector: 'page-register', templateUrl: 'register.html'})
export class RegisterPage {

    registerForm: FormGroup;

    constructor(private nav: NavController, private formBuilder : FormBuilder, private navParams: NavParams, private loadingDialog: LoadingDialog, private store: SiteStore, private userService: FirestoreUserService, private authService: FirestoreAuthService, private storage: Storage) {
        this.registerForm = this.formBuilder.group({
            email: [this.navParams.get('email'), Validators.compose([Validators.required, Validators.email])],
            username: ['', Validators.compose([Validators.required, Validators.minLength(4)])],
            password: [this.navParams.get('password'), Validators.compose([Validators.required, Validators.minLength(6)])]
        });
    }

    private register()
    {
        this.loadingDialog.present("Registering...");

        const email = this.registerForm.value.email.toLowerCase();
        const name = this.registerForm.value.username;
        const password = this.registerForm.value.password; 

        return this.authService.register(email, name, password)
        .then(response => this.userService.createUser(response.uid, email, name).then(() => response.uid))
        .then(uid =>
            this.userService.getUserById(uid).then((user: User) => {
                this.loadingDialog.dismiss();
                this.store.setUser(user);
                return this.storage.set(StorageKey.UserId, user.id)
                    .then(value => this.nav.setRoot(DashBoardPage));
            })
        )
        .catch(error => {
            let message = "Unable to register";
            if (error.code === FirestoreError.EmailAlreadyExists) message = "Email already registered";

            this.loadingDialog.dismiss();
            this.loadingDialog.present(message, { spinner: "hide", enableBackdropDismiss: true });
        });
    }
}
