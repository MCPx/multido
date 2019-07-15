import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { List } from 'models/list';
import { Item } from 'models/item';
import { SiteStore } from 'services/siteStore';
import { FirestoreListService } from 'services/firestoreList.service';
import { FirestoreFileService } from 'services/firestoreFile.service';
import { FirebaseCloudService } from 'services/firebaseCloud.service';
import { CachingService } from 'services/caching.service';
import { uuid } from 'util/utility';
import { tap } from 'rxjs/operators';
import _ from 'lodash';
import { ILocalNotification, LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import CameraOptions from 'config/cameraConfig';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {

    lists: List[];
    isLoading: boolean;

    constructor(
        private router: Router,
        private alertCtrl: AlertController,
        private store: SiteStore,
        private listService: FirestoreListService,
        private fileService: FirestoreFileService,
        private camera: Camera,
        private cachingService: CachingService,
        private firebaseCloudService: FirebaseCloudService,
        private localNotifications: LocalNotifications) {
        this.firebaseCloudService.listenToNotifications()
            .pipe(
                tap(message => {
                        console.log('NOTIFICATION', message);
                        this.localNotifications.schedule({
                                id: parseInt(_.uniqueId(), 10),
                                text: message,
                                data: { custom_data: 'woop de woop' }
                            } as ILocalNotification
                        );
                    }
                )
            );
    }

    ionViewWillEnter() {
        return this.loadLists();
    }

    private async loadLists(): Promise<void[]> {
        this.isLoading = true;

        this.lists = await this.listService.getListsForUser(this.store.getUser());
        this.isLoading = false;

        const imageFetchPromises: Promise<void>[] = [];

        this.lists.forEach(list => {
            if (list.imageId === undefined) {
                return;
            }

            imageFetchPromises.push(
                this.fetchImageData(list)
                    .catch(err => console.log('Error fetching list image', err))
            );
        });

        return Promise.all(imageFetchPromises);
    }

    async fetchImageData(list: List): Promise<void> {
        list.imageData = await this.cachingService
            .tryGetOrAdd(list.imageId, () => this.fileService.getImageById(list.imageId));
    }

    async handleListClick(list: List) {
        return await this.router.navigate(['/list'], { queryParams: { list } });
    }

    getListSubtext(items: Item[] = []) {
        return items.length + ' item' + (items.length === 1 ? '' : 's');
    }

    async handleAddListClick() {
        const addListAlert = await this.alertCtrl.create({
            header: 'Add',
            inputs: [{
                type: 'text',
                name: 'name'
            }],
            buttons: [
                'Cancel',
                {
                    text: 'Save',
                    handler: data => {
                        const newList = { name: data.name, items: [] } as List;

                        this.lists.push(newList); // add list locally, should be updated with properties when getLists is called
                        const addListPromise = this.listService.addListForUser(this.store.getUser(), newList.name);
                        this.router.navigate(['/list'], { queryParams: { list: newList, addListPromise } });
                        return true;
                    }
                }],
        });

        return addListAlert.present();
    }

    // update lists locally, then on firestore
    async handleDeleteClick(e, listToRemove) {
        e.stopPropagation(); // don't trigger click on surrounding card

        const deleteConfirm = await this.alertCtrl.create({
            header: 'Remove yourself from this list?',
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
        this.lists = this.lists.filter(list => list.id !== listToRemove.id);
        return this.listService.removeListForCurrentUser(this.store.getUser(), listToRemove)
            .then(() => this.loadLists())
            .catch(error => {
                console.error(error);
                this.lists.push(listToRemove);
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

            if (!imageData) {
                return;
            }

            list.imageId = uuid();
            list.imageData = `data:image/jpeg;base64,${imageData}`;

            this.cachingService.add(list.imageId, list.imageData);
            await this.fileService.uploadImage(list.imageId, list.imageData);
            await this.listService.updateList(list);
        } catch (error) {
            console.error(error);
        }
    }

    async handleLongPress(listToEdit: List) {
        return this.displayManagePage(listToEdit);
    }

    private async displayManagePage(list: List): Promise<any> {
        return this.router.navigate(['/manageList'],
            { queryParams: { knownUserEmails: this.store.getUser().knownUserEmails, list } });
    }

}
