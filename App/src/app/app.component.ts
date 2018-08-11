import { Component, ViewChild } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { LoginPage } from 'pages/login/login';
import { DashBoardPage } from 'pages/dashboard/dashboard';
import { User } from 'models/user';
import { StorageKey } from 'enums/storageKey';
import { SiteStore } from 'services/siteStore';
import { FirestoreAuthService } from "services/firestoreAuthService";
import { FirestoreUserService } from "services/firestoreUserService";
import { FirebaseCloudService } from "services/firebaseCloudService";
import { Subject } from 'rxjs/Subject';
import { tap } from 'rxjs/operators';
import { LocalNotifications } from '@ionic-native/local-notifications';
import _ from 'lodash';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild('content') nav;

    rootPage: any;

    constructor(
        platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private storage: Storage, private store: SiteStore, private authService: FirestoreAuthService, private userService: FirestoreUserService, private firebaseCloudService : FirebaseCloudService, private localNotifications: LocalNotifications) {
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();

            this.firebaseCloudService.listenToNotifications().pipe(
                            tap(message => {
                                this.localNotifications.schedule({
                                    id: parseInt(_.uniqueId()),
                                    text: message,
                                    data: { custom_data: 'testtest' }
                                  });
            }));

            // try to fetch UserId from storage - if not then send to LoginPage
            return this.storage.get(StorageKey.UserId)
                .then((id: string) => {
                    if (!id) return Promise.reject("User Id was null");

                    return this.userService.getUserById(id).then((user: User) => {
                        this.store.setUser(user);
                        this.rootPage = DashBoardPage;


                        
                    });
                })
                .catch(error => this.rootPage = LoginPage)
                .then(() => splashScreen.hide());
        });
    }

    public logOut() {
        this.authService.signOut().then(result => {
            this.store.clearUser();
            return this.nav.setRoot(LoginPage);
        })
    }
}
