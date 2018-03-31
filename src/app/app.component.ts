import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../pages/login/login';
import { DashBoardPage } from '../pages/dashboard/dashboard';
import { SiteStore } from '../services/siteStore';
import { User } from '../models/user';
import { storageKey } from '../enums/storageKeys';
import { FirestoreService } from '../services/firestoreService';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private storage: Storage, private store: SiteStore, private firestoreService: FirestoreService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();

      // try to fetch UserId from storage - if not then send to LoginPage
      this.storage.get(storageKey.UserId)
        .then((id: string) => 
        {
          if (!id) return Promise.reject("Id was null");
          
          this.firestoreService.getUserById(id).then((user : User) => {
            this.store.setUser(user);
            splashScreen.hide();
            this.rootPage = DashBoardPage;
          });
        })
        .catch((error) => {
          splashScreen.hide();
          this.rootPage = LoginPage;
        })
    });
  }
}