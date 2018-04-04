import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SiteStore } from '../../services/siteStore';
import { DashBoardPage } from '../dashboard/dashboard'
import { FirestoreService } from '../../services/firestoreService';
import { User } from '../../models/user';
import { storageKey } from '../../enums/storageKey';
import { LoadingDialog } from '../components/loadingdialog';
import { Storage } from '@ionic/storage';
import { firestoreError } from '../../enums/firestoreError';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';

@Component({selector: 'page-register', templateUrl: 'register.html'})
export class RegisterPage {

    registerForm: FormGroup;

    constructor(private nav: NavController, private formBuilder : FormBuilder, private navParams: NavParams, private loadingDialog: LoadingDialog, private store: SiteStore, private firestoreService: FirestoreService, private storage: Storage) {           
        this.registerForm = this.formBuilder.group({
            email: [this.navParams.get('email'), Validators.compose([Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)])],
            username: ['', Validators.compose([Validators.required, Validators.minLength(4)])],
            password: [this.navParams.get('password'), Validators.compose([Validators.required, Validators.minLength(6)])]
        });
    }

    private register()
    {
        this.loadingDialog.present("Registering...");

        this.firestoreService.register(this.registerForm.value.email, this.registerForm.value.username, this.registerForm.value.password)
        .then(response => {
            this.firestoreService.getUserById(response.uid).then((user: User) => {
                this.loadingDialog.dismiss();
                this.store.setUser(user);
                this.storage.set(storageKey.userId, user.id);
                this.nav.push(DashBoardPage);
            });
        })
        .catch(error => {            
            let message = "Unable to register";
            if (error.code === firestoreError.emailAlreadyExists) message = "Email already registered";
                
            this.loadingDialog.dismiss();
            this.loadingDialog.present(message, { spinner: "hide", enableBackdropDismiss: true });
            console.log("error", error);
        });
    }
}