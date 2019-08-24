import FirestoreCredentials from './../firestoreCredentials';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, ModalController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';

import { AngularFireAuth } from '@angular/fire/auth';
import { MyApp } from './app.component';
import { LoginPage } from 'pages/login/login';
import { DashBoardPage } from 'pages/dashboard/dashboard';
import { ListPage } from 'pages/list/list';
import { LoadingDialog } from 'pages/components/loadingdialog';
import { RegisterPage } from 'pages/register/register';
import { ManageListPage } from 'pages/manageList/manageList';
import { FirestoreListService } from 'services/firestoreListService';
import { FirestoreUserService } from "services/firestoreUserService";
import { FirestoreAuthService } from "services/firestoreAuthService";
import { FirebaseCloudService } from "services/firebaseCloudService";
import { CachingService } from 'services/cachingService'
import { AngularFireStorageModule } from '@angular/fire/storage';
import { FirestoreFileService } from 'services/firestoreFileService';
import { Camera } from '@ionic-native/camera';
import { HTTP } from '@ionic-native/http';
import { GooglePlus } from '@ionic-native/google-plus';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Firebase } from '@ionic-native/firebase';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from 'store/reducers';

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
        IonicStorageModule.forRoot(),
        StoreModule.forRoot(reducers, { metaReducers })
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
        FirestoreUserService,
        FirestoreListService,
        FirestoreAuthService,
        FirestoreFileService,
        FirebaseCloudService,
        CachingService,
        AngularFireAuth,
        LoadingDialog,
        ModalController,
        Camera,
        HTTP,
        GooglePlus,
        LocalNotifications,
        Firebase,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
    ]
})
export class AppModule { }
