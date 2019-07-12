import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Storage } from '@ionic/storage';
import { User } from 'models/user';
import { StorageKey } from 'enums/storageKey';
import { SiteStore } from 'services/siteStore';
import { FirestoreAuthService } from 'services/firestoreAuth.service';
import { FirestoreUserService } from 'services/firestoreUser.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    @ViewChild('content') nav;

    rootPage: any;

    constructor(
        private platform: Platform,
        private statusBar: StatusBar,
        private splashScreen: SplashScreen,
        private router: Router,
        private storage: Storage,
        private store: SiteStore,
        private authService: FirestoreAuthService,
        private userService: FirestoreUserService
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            return this.storage.get(StorageKey.UserId)
                .then(async (id: string) => {
                    if (!id) throw new Error('User Id was null');

                    const user = await this.userService.getUserById(id);
                    await this.store.setUser(user);
                    // return this.router.navigate(['/dashboard']);
                })
                .catch(error => this.router.navigate(['/login']))
                .then(() => this.splashScreen.hide());
        });
    }

    public async logOut() {
        await this.authService.signOut();
        await this.store.clearUser();
        // return this.nav.setRoot(LoginPage);
    }
}
