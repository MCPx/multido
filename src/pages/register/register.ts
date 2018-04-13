import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SiteStore } from '../../services/siteStore';
import { DashBoardPage } from '../dashboard/dashboard'
import { User } from '../../models/user';
import { StorageKey } from '../../enums/storageKey';
import { LoadingDialog } from '../components/loadingdialog';
import { Storage } from '@ionic/storage';
import { FirestoreError } from '../../enums/firestoreError';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { FirestoreUserService } from "../../services/firestoreUserService";
import { FirestoreAuthService } from "../../services/firestoreAuthService";

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
        console.log("Registering...", this.registerForm);

        this.authService.register(this.registerForm.value.email.toLowerCase(), this.registerForm.value.username, this.registerForm.value.password)
        .then(response => {
            this.userService.getUserById(response.uid).then((user: User) => {
                this.loadingDialog.dismiss();
                this.store.setUser(user);
                return this.storage.set(StorageKey.UserId, user.id)
                    .then(value => this.nav.push(DashBoardPage));
            });
        })
        .catch(error => {
            let message = "Unable to register";
            if (error.code === FirestoreError.EmailAlreadyExists) message = "Email already registered";

            this.loadingDialog.dismiss();
            this.loadingDialog.present(message, { spinner: "hide", enableBackdropDismiss: true });
            console.log("error", error);
        });
    }
}
