import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { SiteStore } from 'services/siteStore';
import { FirestoreUserService } from 'services/firestoreUser.service';
import { FirestoreAuthService } from 'services/firestoreAuth.service';
import { FirebaseCloudService } from 'services/firebaseCloud.service';
import { User } from 'models/user';
import { StorageKey } from 'enums/storageKey';
import { FirestoreError } from 'enums/firestoreError';
import { Router } from '@angular/router';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';

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
        private store: SiteStore,
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

    private login() {
        this.loading = true;

        this.authService.signIn(this.loginForm.value.email, this.loginForm.value.password)
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
        return this.authService.signInWithGoogle()
            .then((gplusUser: any) => {
                console.log('returned user');
                console.dir(gplusUser);
                // check if user in OUR firebase
                return this.userService.getUserById(gplusUser.uid)
                    .then((user: User) => {
                        console.dir(user);
                        if (user) {
                            return this.loginUser(user);
                        }

                        // does not exist
                        console.log('Unable to find user in firestore', gplusUser);
                        return this.userService.createUser(gplusUser.uid, gplusUser.email, gplusUser.displayName)
                            .then(() => {
                                return this.userService.getUserById(gplusUser.uid).then((user: User) => {
                                    console.log('fetched user', user);
                                    return this.loginUser(user);
                                });
                            });
                    });
            })
            .catch(error => this.loadingDialog.present(`Error: ${JSON.stringify(error)}`, {
                spinner: 'hide',
                enableBackdropDismiss: true
            }));
    }

    private resetPassword() {
        // TODO: show popup with input (default to what they entered in login)
        // const nameEditAlert = this.alertCtrl.create({
        //     title: 'Enter your email address',
        //     inputs: [{
        //         type: 'text',
        //         value: this.loginForm.value.email,
        //         name: 'email'
        //     }],
        //     buttons: [
        //         'Cancel',
        //         {
        //             text: 'Save',
        //             handler: data => {
        //                 try {
        //                     this.authService.resetPassword(data.email)
        //                         .then(() => this.loadingDialog.present('Password reset email sent', {
        //                             spinner: 'hide',
        //                             enableBackdropDismiss: true
        //                         }));
        //                 } catch (error) {
        //                     console.log(error);
        //                     this.loadingDialog.present('Email provided was not valid', {
        //                         spinner: 'hide',
        //                         enableBackdropDismiss: true
        //                     });
        //                 }
        //             }
        //         }],
        // });
        //
        // nameEditAlert.present();

    }

    private loginUser(user: User): Promise<boolean> {
        this.loading = false;
        this.store.setUser(user);
        // save token for push notifications
        return this.firebaseCloudService.generateToken(user)
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
