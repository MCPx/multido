import { Component } from '@angular/core';
import { AlertController, AlertOptions, NavController } from 'ionic-angular';
import { SiteStore } from 'services/siteStore';
import { FirestoreListService } from 'services/firestoreListService';
import { List } from 'models/list';
import { Item } from 'models/item';
import { ListPage } from 'pages/list/list';
import { ManageListPage } from 'pages/manageList/manageList';
import { FirestoreFileService } from 'services/firestoreFileService';
import { Camera } from '@ionic-native/camera';
import { uuid } from 'util/utility'
import { CachingService } from 'services/cachingService';
import { tap, map } from "rxjs/operators";
import _ from "lodash";
import { FirebaseCloudService } from "services/firebaseCloudService";
import { ILocalNotification, LocalNotifications } from "@ionic-native/local-notifications";
import CameraOptions from 'config/cameraConfig';
import { Store } from '@ngrx/store';
import * as ListActions from 'store/actions/lists.actions';
import { AppState, getAllLists } from 'store/reducers';
import { Observable } from 'rxjs';

@Component({ selector: 'page-dashboard', templateUrl: 'dashboard.html' })
export class DashBoardPage {

    public lists: Observable<List[]>;
    isLoading: boolean;

    constructor(
        private nav: NavController,
        private alertCtrl: AlertController,
        private oldStore: SiteStore,
        private listService: FirestoreListService,
        private fileService: FirestoreFileService,
        private camera: Camera,
        private cachingService: CachingService,
        private firebaseCloudService: FirebaseCloudService,
        private localNotifications: LocalNotifications,
        private store: Store<AppState>) {

        this.firebaseCloudService.listenToNotifications()
            .pipe(
                tap(message => {
                    console.log("NOTIFICATION", message);
                    this.localNotifications.schedule(<ILocalNotification>{
                        id: parseInt(_.uniqueId()),
                        text: message,
                        data: { custom_data: 'woop de woop' }
                    });
                })
            );

        this.lists = this.store.select(getAllLists);
        this.lists.pipe(
            map(this.fetchImages),
            tap(Promise.all)
        )
    }

    private fetchImages(lists: List[]): Promise<void>[] {
        const imageFetchPromises: Promise<void>[] = [];

        lists.forEach(list => {
            if (list.imageId === undefined) return;

            imageFetchPromises.push(
                this.fetchImageData(list)
                    .catch(err => console.log("Error fetching list image", err))
            );
        });
        return imageFetchPromises;
    }

    ionViewWillEnter() {
        return this.loadLists();
    }

    private async loadLists(): Promise<void> {
        this.isLoading = true;

        const newLists = await this.listService.getListsForUser(this.oldStore.getUser());
        this.store.dispatch(new ListActions.UpdateLists({ lists: newLists }));
        this.isLoading = false;
    }

    async fetchImageData(list: List): Promise<void> {
        list.imageData = await this.cachingService
            .tryGetOrAdd(list.imageId, () => this.fileService.getImageById(list.imageId));
    }

    async handleListClick(list: List) {
        return await this.nav.push(ListPage, { list });
    }

    getListSubtext(items: Item[] = []) {
        return items.length + " item" + (items.length == 1 ? "" : "s");
    };

    async handleAddListClick() {
        const addListAlert = this.alertCtrl.create(<AlertOptions>{
            title: 'Add',
            inputs: [{
                type: "text",
                name: "name"
            }],
            buttons: [
                'Cancel',
                {
                    text: 'Save',
                    handler: data => {
                        const newList = <List>{ name: data.name, items: [] };

                        this.lists.push(newList); // add list locally, should be updated with properties when getLists is called
                        const addListPromise = this.listService.addListForUser(this.oldStore.getUser(), newList.name);
                        this.nav.push(ListPage, { list: newList, addListPromise });

                        return true;
                    }
                }],
        });

        return addListAlert.present();
    }

    // update lists locally, then on firestore
    async handleDeleteClick(e, listToRemove) {
        e.stopPropagation(); // don't trigger click on surrounding card

        const deleteConfirm = this.alertCtrl.create(<AlertOptions>{
            title: 'Remove yourself from this list?',
            buttons: [
                'Cancel',
                {
                    text: 'Remove me',
                    handler: () => {
                        this.removeList(listToRemove);
                        return true;
                    }

                }],
        });

        await deleteConfirm.present();
    }

    async removeList(listToRemove) {
        this.isLoading = true;
        this.lists = this.lists.filter(list => list.id != listToRemove.id);
        return this.listService.removeListForCurrentUser(this.oldStore.getUser(), listToRemove)
            .then(() => this.loadLists())
            .catch(error => {
                console.error(error);
                this.lists.push(listToRemove);
                this.isLoading = false;
            });
    }

    async handleDashboardRefresh(e) {
        await this.loadLists()

        e.complete();
    }

    async handleListImageClick(e, list: List) {
        e.stopPropagation(); // don't trigger click on surrounding card

        const options = CameraOptions(this.camera);

        try {
            var imageData = await this.camera.getPicture(options);

            if (!imageData) return;

            list.imageId = uuid();
            list.imageData = `data:image/jpeg;base64,${imageData}`;

            this.cachingService.add(list.imageId, list.imageData);
            await this.fileService.uploadImage(list.imageId, list.imageData);
            await this.listService.updateList(list);
        }
        catch (error) {
            console.error(error);
        }
    }

    async handleLongPress(listToEdit: List) {
        return this.displayManagePage(listToEdit);
    }

    private displayManagePage(list: List): Promise<any> {
        return this.nav.push(ManageListPage, { knownUserEmails: this.oldStore.getUser().knownUserEmails, list });
    }
}
