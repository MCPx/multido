import { Component } from '@angular/core';
import { AlertController, AlertOptions, NavController } from 'ionic-angular';
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
import {AddList, UpdateLists, RemoveList, SelectList} from "../../store/actions/lists.actions";
import { AppState } from 'store/reducers';
import { Observable } from 'rxjs';
import {getAllLists, getSelectedList} from "store/selectors/lists.selectors";
import {User} from "models/user";
import {getUser} from "store/selectors/user.selectors";

@Component({ selector: 'page-dashboard', templateUrl: 'dashboard.html' })
export class DashBoardPage {

    public lists: Observable<List[]>;
    public user: User;

    isLoading: boolean;

    constructor(
        private nav: NavController,
        private alertCtrl: AlertController,
        private listService: FirestoreListService,
        private fileService: FirestoreFileService,
        private camera: Camera,
        private cachingService: CachingService,
        private firebaseCloudService: FirebaseCloudService,
        private localNotifications: LocalNotifications,
        private store: Store<AppState>) {

        console.info("dashboard - constructor");
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
        );

        this.store.select(getUser).subscribe(user => this.user = user);
        // return await this.nav.push(ListPage, { list });
        this.store.select(getSelectedList).subscribe((listId) => {
            if (listId != null)
                this.nav.push(ListPage)
        })
    }

    ionViewWillEnter() {
        this.store.dispatch(new SelectList({ id: null }));
        return this.loadLists();
    }

    private async loadLists(): Promise<void> {
        this.isLoading = true;

        const newLists = await this.listService.getListsForUser(this.user);
        this.store.dispatch(new UpdateLists({ lists: newLists }));
        this.isLoading = false;
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

    async fetchImageData(list: List): Promise<void> {
        list.imageData = await this.cachingService
            .tryGetOrAdd(list.imageId, () => this.fileService.getImageById(list.imageId));
    }

    async handleListClick(list: List) {
        this.store.dispatch(new SelectList({ id: list.id }));
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

                        this.store.dispatch(new AddList({ list: newList })); // add list locally, should be updated with properties when getLists is called
                        const addListPromise = this.listService.addListForUser(this.user, newList.name);
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

    async removeList(listToRemove: List) {
        this.isLoading = true;
        this.store.dispatch(new RemoveList({ id: listToRemove.id }));

        return this.listService.removeListForCurrentUser(this.user, listToRemove)
        .catch(error => {
            console.error(error);
            this.store.dispatch(new AddList({ list: listToRemove }));

            this.isLoading = false;
        });
    }

    async handleDashboardRefresh(e) {
        await this.loadLists();

        e.complete();
    }

    async handleListImageClick(e, list: List) {
        e.stopPropagation(); // don't trigger click on surrounding card

        const options = CameraOptions(this.camera);

        try {
            const imageData = await this.camera.getPicture(options);

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
        return this.nav.push(ManageListPage, { knownUserEmails: this.user.knownUserEmails, list });
    }
}
