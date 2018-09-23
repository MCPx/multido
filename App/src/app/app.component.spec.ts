import { async, TestBed } from '@angular/core/testing';
import { IonicModule, Platform } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirestoreAuthService } from "services/firestoreAuthService";
import { FirestoreUserService } from "services/firestoreUserService";
import { SiteStore } from "../services/siteStore";

import { MyApp } from './app.component';

import { PlatformMock,
    StatusBarMock,
    SplashScreenMock,
    StorageMock } from 'ionic-mocks'

describe('MyApp Component', () => {
    let fixture;
    let component;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MyApp],
            imports: [
                IonicModule.forRoot(MyApp)
            ],
            providers: [
                { provide: StatusBar, useFactory: () => StatusBarMock.instance() },
                { provide: SplashScreen, useFactory: () => SplashScreenMock.instance() },
                { provide: Platform, useFactory: () => PlatformMock.instance() },
                { provide: Storage, useFactory: () => StorageMock.instance() },
                { provide: SiteStore },
                { provide: FirestoreAuthService },
                { provide: FirestoreUserService }
            ]
        })
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MyApp);
        component = fixture.componentInstance;
    });

    it('should be created', () => {
        expect(component instanceof MyApp).toBe(true);
    });

    it('should have two pages', (done) => {
        component.logOut().then(() => {
            expect(component.rootPage).toBe(null);
            done();
        });
    });

});
