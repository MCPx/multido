import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, ModalController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';

import { AngularFireAuth } from 'angularfire2/auth';
import { MyApp } from './app.component';
import { LoginPage } from 'pages/login/login';
import { DashBoardPage } from 'pages/dashboard/dashboard';
import { ListPage } from 'pages/list/list';
import { LoadingDialog } from 'pages/components/loadingdialog';
import { RegisterPage } from 'pages/register/register';
import { ManageListPage } from 'pages/components/manageList/manageList';
import { SiteStore } from 'services/siteStore';
import { FirestoreListService } from 'services/firestoreListService';
import { FirestoreUserService } from "services/firestoreUserService";
import { FirestoreAuthService } from "services/firestoreAuthService";

@NgModule({
    declarations: [
        MyApp,
        LoginPage,
        RegisterPage,
        DashBoardPage,
        ListPage,
        ManageListPage
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
        IonicModule.forRoot(MyApp),
        IonicStorageModule.forRoot()
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        LoginPage,
        RegisterPage,
        DashBoardPage,
        ListPage,
        ManageListPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        SiteStore,
        FirestoreUserService,
        FirestoreListService,
        FirestoreAuthService,
        AngularFireAuth,
        LoadingDialog,
        ModalController,
        Storage,
        { provide: ErrorHandler, useClass: IonicErrorHandler }
    ]
})
export class AppModule { }
