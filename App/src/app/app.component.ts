import { Component, ViewChild } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { LoginPage } from 'pages/login/login';
import { DashBoardPage } from 'pages/dashboard/dashboard';
import { User } from 'models/user';
import { StorageKey } from 'enums/storageKey';
import { FirestoreAuthService } from "services/firestoreAuthService";
import { FirestoreUserService } from "services/firestoreUserService";
import {AppState} from "../store/reducers";
import {Store} from "@ngrx/store";
import {ClearUser, SetUser} from "../store/actions/user.actions";

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild('content') nav;

    rootPage: any;

    constructor(
        platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private storage: Storage, private store: Store<AppState>, private authService: FirestoreAuthService, private userService: FirestoreUserService) {
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            statusBar.styleDefault();

            // try to fetch UserId from storage - if not then send to LoginPage
            return this.storage.get(StorageKey.UserId)
                .then((id: string) => {
                    if (!id) throw "User Id was null";

                    return this.userService.getUserById(id).then((user: User) => {
                        this.store.dispatch(new SetUser({user}));
                        this.rootPage = DashBoardPage;
                    });
                })
                .catch(error => this.rootPage = LoginPage)
                .then(() => splashScreen.hide());
        });
    }

    public async logOut() {
        await this.authService.signOut();
        await this.store.dispatch(new ClearUser());
        return this.nav.setRoot(LoginPage);
    }
}
