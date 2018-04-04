import { Component, ViewChild } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../pages/login/login';
import { DashBoardPage } from '../pages/dashboard/dashboard';
import { SiteStore } from '../services/siteStore';
import { User } from '../models/user';
import { storageKey } from '../enums/storageKey';
import { FirestoreService } from '../services/firestoreService';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild('content') nav

    rootPage: any;
    
    constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private storage: Storage, private store: SiteStore, private firestoreService: FirestoreService) {
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();

            // try to fetch UserId from storage - if not then send to LoginPage
            return this.storage.get(storageKey.userId)
                .then((id: string) => {
                    if (!id) return Promise.reject("User Id was null");

                    return this.firestoreService.getUserById(id).then((user: User) => {
                        this.store.setUser(user);
                        this.rootPage = DashBoardPage;
                    });
                })
                .catch(error => this.rootPage = LoginPage)
                .then(() => splashScreen.hide());
        });
    }

    public logOut() {
        this.firestoreService.signOut().then(result => {
            this.store.clearUser();
            this.nav.setRoot(LoginPage);
        })
    }
}