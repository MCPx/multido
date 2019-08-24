import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as TypeMoq from 'typemoq';
import { IonicModule, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirestoreAuthService } from "services/firestoreAuthService";
import { FirestoreUserService } from "services/firestoreUserService";
import { MyApp } from './app.component';
import { PlatformMock,
    StatusBarMock,
    SplashScreenMock,
    StorageMock} from 'ionic-mocks'
import { MockComponent } from 'ng-mocks';
import { Times } from 'typemoq';
import { LoginPage } from "../pages/login/login";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import {AppState} from "../store/reducers";
import {Store} from "@ngrx/store";

describe('MyApp Component', () => {
    let fixture: ComponentFixture<MyApp>;
    let component;
    const authServiceMock: TypeMoq.IMock<FirestoreAuthService> = TypeMoq.Mock.ofType<FirestoreAuthService>(undefined, TypeMoq.MockBehavior.Loose);
    const userServiceMock: TypeMoq.IMock<FirestoreUserService> = TypeMoq.Mock.ofType<FirestoreUserService>(undefined, TypeMoq.MockBehavior.Loose);
    const siteStoreMock: TypeMoq.IMock<Store<AppState>> = TypeMoq.Mock.ofType<Store<AppState>>(undefined, TypeMoq.MockBehavior.Loose);

    beforeEach(async(() => {
        authServiceMock.setup(x => x.signOut()).returns(() => Promise.resolve(undefined));
        siteStoreMock.setup(x => x.clearUser());

        TestBed.configureTestingModule({
            declarations: [MyApp,
                MockComponent(LoginPage)],
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
                { provide: FirestoreUserService, useFactory: () => userServiceMock.object }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MyApp);
        fixture.detectChanges();
        component = fixture.componentInstance;
    });

    it('should be created', () => {
        expect(component instanceof MyApp).toBe(true);
    });

    it('should clear user and go to login page on log out', async (done) => {
        await component.logOut();
        siteStoreMock.verify(x => x.clearUser(), Times.once());
        expect(component.rootPage).toBe(null);
        done();
    });

});
