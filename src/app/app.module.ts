import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { IonicModule, IonicRouteStrategy, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import FirestoreCredentials from './firestoreCredentials';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';

import { SiteStore } from 'services/siteStore';
import { FirestoreListService } from 'services/firestoreList.service';
import { FirestoreUserService } from 'services/firestoreUser.service';
import { FirestoreAuthService } from 'services/firestoreAuth.service';
import { FirestoreFileService } from 'services/firestoreFile.service';
import { FirebaseCloudService } from 'services/firebaseCloud.service';
import { CachingService } from 'services/caching.service';

import { HTTP } from '@ionic-native/http/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Firebase } from '@ionic-native/firebase/ngx';
import { IonicStorageModule } from '@ionic/storage';

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
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
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        AppRoutingModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        SiteStore,
        FirestoreUserService,
        FirestoreListService,
        FirestoreAuthService,
        FirestoreFileService,
        FirebaseCloudService,
        CachingService,
        AngularFireAuth,
        LoadingDialogComponent,
        ModalController,
        Camera,
        HTTP,
        GooglePlus,
        LocalNotifications,
        Firebase,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
