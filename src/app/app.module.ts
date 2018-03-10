import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SiteStore } from '../services/siteStore';
import { DashBoardPage } from '../pages/dashboard/dashboard';
import { FirestoreService } from '../services/firestoreService';
import { ListPage } from '../pages/list/list';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    DashBoardPage,
    ListPage
  ],
  imports: [
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyBWglBGLsT9VKKhnBF4mnAd7_rhL4vzjfs",
      authDomain: "multido-4f75f.firebaseapp.com",
      databaseURL: "https://multido-4f75f.firebaseio.com",
      projectId: "multido-4f75f",
      storageBucket: "",
      messagingSenderId: "793639388905"
    }, 'angularfs'),
    AngularFirestoreModule,
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    DashBoardPage,
    ListPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    SiteStore,
    FirestoreService,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
