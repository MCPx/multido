import { async, TestBed } from '@angular/core/testing';
import * as TypeMoq from 'typemoq';
import { IonicModule, Platform } from 'ionic-angular';

import { ActionSheetController, AlertController, NavController, NavParams } from 'ionic-angular';
import { FirestoreListService } from 'services/firestoreListService';
import { SiteStore } from 'services/siteStore';
import { ListPage } from './list';
import {
    PlatformMock,
    ActionSheetControllerMock,
    AlertControllerMock,
    NavControllerMock
} from 'ionic-mocks'
import { Times, It } from 'typemoq';

describe('ListPage Component', () => {
    let fixture;
    let component;
    const listServiceMock: TypeMoq.IMock<FirestoreListService> = TypeMoq.Mock.ofType<FirestoreListService>(undefined, TypeMoq.MockBehavior.Loose);
    const siteStoreMock: TypeMoq.IMock<SiteStore> = TypeMoq.Mock.ofType<SiteStore>(undefined, TypeMoq.MockBehavior.Loose);
    const navParamsMock: TypeMoq.IMock<NavParams> = TypeMoq.Mock.ofType<NavParams>(undefined, TypeMoq.MockBehavior.Loose);

    beforeEach(async(() => {
        listServiceMock.setup(x => x.updateList(It.isAny())).returns(() => Promise.resolve(undefined));
        siteStoreMock.setup(x => x.clearUser());

        TestBed.configureTestingModule({
            declarations: [ListPage],
            imports: [
                IonicModule.forRoot(ListPage)
            ],
            providers: [
                { provide: NavParams, useFactory: () => navParamsMock.object },
                { provide: FirestoreListService, useFactory: () => listServiceMock.object },
                { provide: SiteStore, useFactory: () => siteStoreMock.object },
                { provide: NavController, useFactory: () => NavControllerMock.instance() },
                { provide: AlertController, useFactory: () => AlertControllerMock.instance() },
                { provide: ActionSheetController, useFactory: () => ActionSheetControllerMock.instance() },
                { provide: Platform, useFactory: () => PlatformMock.instance() },
            ]
        })
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ListPage);
        component = fixture.componentInstance;
    });

    it('should be created', () => {
        expect(component instanceof ListPage).toBe(true);
    });

    it('should update list', async (done) => {
        await component.updateList();
        listServiceMock.verify(x => x.updateList(It.isAny()), Times.once());
        done();
    });

});
