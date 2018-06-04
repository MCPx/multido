import FirestoreCredentials from './../firestoreCredentials';
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
import { ManageListPage } from 'pages/manageList/manageList';
import { SiteStore } from 'services/siteStore';
import { FirestoreListService } from 'services/firestoreListService';
import { FirestoreUserService } from "services/firestoreUserService";
import { FirestoreAuthService } from "services/firestoreAuthService";
import { CachingService } from 'services/cachingService'
import { AngularFireStorageModule } from 'angularfire2/storage';
import { FirestoreFileService } from 'services/firestoreFileService';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { HTTP } from '@ionic-native/http';

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
            apiKey: FirestoreCredentials.apiKey,
            authDomain: FirestoreCredentials.authDomain,
            databaseURL: FirestoreCredentials.databaseURL,
            projectId: FirestoreCredentials.projectId,
            storageBucket: FirestoreCredentials.storageBucket,
            messagingSenderId: FirestoreCredentials.messagingSenderId
        }, 'angularfs'),
        AngularFirestoreModule,
        AngularFireStorageModule,
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
        FirestoreFileService,
        CachingService,
        AngularFireAuth,
        LoadingDialog,
        ModalController,
        Camera,
        HTTP,
        Storage,
        { provide: ErrorHandler, useClass: IonicErrorHandler }
    ]
})
export class AppModule { }
