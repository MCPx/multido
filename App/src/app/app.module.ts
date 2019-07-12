import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { IonicModule, IonicRouteStrategy, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import FirestoreCredentials from './firestoreCredentials';
import { FirestoreListService } from 'services/firestoreList.service';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';
import { Firebase } from '@ionic-native/firebase';
import { SiteStore } from 'services/siteStore';
import { FirestoreUserService } from 'services/firestoreUser.service';
import { FirestoreAuthService } from 'services/firestoreAuth.service';
import { FirestoreFileService } from 'services/firestoreFile.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { FirebaseCloudService } from 'services/firebaseCloud.service';
import { GooglePlus } from '@ionic-native/google-plus';
import { CachingService } from 'services/caching.service';
import { HTTP } from '@ionic-native/http';

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
        AppRoutingModule],
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
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
