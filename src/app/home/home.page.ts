import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { FirestoreUserService } from 'services/firestoreUser.service';
import { FirestoreAuthService } from 'services/firestoreAuth.service';
import { FirebaseCloudService } from 'services/firebaseCloud.service';
import { User } from 'models/user';
import { StorageKey } from 'enums/storageKey';
import { FirestoreError } from 'enums/firestoreError';
import { Router } from '@angular/router';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';
import { Store } from '@ngrx/store';
import { AppState } from 'store/reducers';
import { SetUser } from 'store/actions/user.actions';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

    loginForm: FormGroup;
    showPasswordText = false;
    loading = false;

    constructor(
        private router: Router,
        private nav: NavController,
        formBuilder: FormBuilder,
        private loadingDialog: LoadingDialogComponent,
        private store: Store<AppState>,
        private userService: FirestoreUserService,
        private alertCtrl: AlertController,
        private authService: FirestoreAuthService,
        private storage: Storage,
        private firebaseCloudService: FirebaseCloudService) {

        this.loginForm = formBuilder.group({
            email: ['', Validators.compose([Validators.required, Validators.email])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
        });
    }

    ngOnInit() {
    }

    async login() {
        this.loading = true;

        await this.authService.signIn(this.loginForm.value.email, this.loginForm.value.password)
            .then(response => {
                console.log('sign in response', response);
                return this.userService.getUserById(response.user.uid);
            })
            .then((user: User) => {
                return this.loginUser(user);
            })
            .catch(error => {
                console.log(error);
                let message = JSON.stringify(error);
                if (error.code === FirestoreError.UnknownUser || error.code === FirestoreError.WrongPassword) {
                    message = 'Invalid username or password';
                }

                this.loading = false;
                this.loadingDialog.dismiss();
                this.loadingDialog.present(message, { spinner: 'hide', enableBackdropDismiss: true });
            });
    }

    private loginWithGoogle() {
        this.loading = true;
        return this.authService.signInWithGoogle()
            .then((gplusUser: any) => {
                // check if user in OUR firebase
                return this.userService.getUserById(gplusUser.uid)
                    .then((user: User) => {
                        if (user)
                            return this.loginUser(user);

                        // does not exist
                        return this.userService.createUser(gplusUser.uid, gplusUser.email, gplusUser.displayName)
                            .then(() => {
                                return this.userService.getUserById(gplusUser.uid).then((user: User) => this.loginUser(user));
                            });
                    });
            })
            .catch(async error => {
                this.loading = false;
                await this.loadingDialog.present(`Error: ${JSON.stringify(error)}`, {
                    spinner: 'hide',
                    enableBackdropDismiss: true
                });
            });
    }

    async resetPassword() {
        // TODO: show popup with input (default to what they entered in login)
        const nameEditAlert = await this.alertCtrl.create({
            header: 'Enter your email address',
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
                        try {
                            this.authService.resetPassword(data.email)
                                .then(() => this.loadingDialog.present('Password reset email sent', {
                                    spinner: "hide",
                                    enableBackdropDismiss: true
                                }))
                        } catch (error) {
                            console.log(error);
                            this.loadingDialog.present('Email provided was not valid', {
                                spinner: "hide",
                                enableBackdropDismiss: true
                            })
                        }
                    }
                }],
        });

        return nameEditAlert.present();
    }

    async loginUser(user: User): Promise<void> {
        this.loading = false;
        this.store.dispatch(new SetUser({ user }));
        // save token for push notifications
        await this.firebaseCloudService.generateToken(user)
            .then(value => {
                console.log('Saved firebase token', value);

                return this.storage.set(StorageKey.UserId, user.id).then(() => this.router.navigate(['/dashboard']));
            });
    }

    async handleRegisterClick(e) {
        e.preventDefault();
        await this.router.navigate(['/register'], { queryParams: { ...this.loginForm.value } });
    }

}
