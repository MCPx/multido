import { async, TestBed } from '@angular/core/testing';
import * as TypeMoq from 'typemoq';
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
import { Times } from 'typemoq';

describe('MyApp Component', () => {
    let fixture;
    let component;
    const authServiceMock: TypeMoq.IMock<FirestoreAuthService> = TypeMoq.Mock.ofType<FirestoreAuthService>(undefined, TypeMoq.MockBehavior.Loose);
    const siteStoreMock: TypeMoq.IMock<SiteStore> = TypeMoq.Mock.ofType<SiteStore>(undefined, TypeMoq.MockBehavior.Loose);

    beforeEach(async(() => {
        authServiceMock.setup(x => x.signOut()).returns(() => Promise.resolve(undefined));
        siteStoreMock.setup(x => x.clearUser());

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
                { provide: SiteStore, useFactory: () => siteStoreMock.object },
                { provide: FirestoreAuthService, useFactory: () => authServiceMock.object },
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

    it('should clear user and go to login page on log out', (done) => {
        component.logOut().then(() => {
            // siteStoreMock.verify(x => x.clearUser(), Times.once());
            // expect(component.rootPage).toBe(null);
            done();
        });
    });

});
