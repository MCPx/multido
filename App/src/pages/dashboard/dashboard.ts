import { Component } from '@angular/core';
import { AlertController, NavController } from 'ionic-angular';
import { SiteStore } from 'services/siteStore';
import { FirestoreListService } from 'services/firestoreListService';
import { List } from 'models/list';
import { Item } from 'models/item';
import { ListPage } from 'pages/list/list';
import { ManageListPage } from 'pages/manageList/manageList';
import { FirestoreFileService } from 'services/firestoreFileService';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { uuid } from 'util/utility'
import { CachingService } from 'services/cachingService';
import { tap } from "rxjs/operators";
import _ from "lodash";
import { FirebaseCloudService } from "services/firebaseCloudService";
import { ILocalNotification, LocalNotifications } from "@ionic-native/local-notifications";

@Component({ selector: 'page-dashboard', templateUrl: 'dashboard.html' })
export class DashBoardPage {

    lists: List[];
    isLoading: boolean;

    constructor(private nav: NavController, private alertCtrl: AlertController, private store: SiteStore, private listService: FirestoreListService, private fileService: FirestoreFileService, private camera: Camera, private cachingService: CachingService, private firebaseCloudService: FirebaseCloudService, private localNotifications: LocalNotifications) {
        this.firebaseCloudService.listenToNotifications()
            .pipe(
                tap(message => {
                        console.log("NOTIFICATION", message);
                        this.localNotifications.schedule(<ILocalNotification>{
                                id: parseInt(_.uniqueId()),
                                text: message,
                                data: { custom_data: 'woop de woop' }
                            }
                        );
                    }
                )
            );
    }

    ionViewWillEnter() {
        return this.loadLists();
    }

    private loadLists() {
        this.isLoading = true;
        return this.listService.getListsForUser(this.store.getUser())
            .then(lists => {
                this.lists = lists;
                this.isLoading = false;

                return lists;
            }).then(lists => {
                // fetch images
                lists.forEach(list => {
                    if (list.imageId === undefined) return;

                    this.cachingService
                        .tryGetOrAdd(list.imageId, () => {
                            return this.fileService.getImageById(list.imageId);
                        })
                        .then(data => list.imageData = data)
                        .catch(err => console.log("Error fetching list image", err));
                });
            });
    }

    async handleListClick(list: List) {
        return await this.nav.push(ListPage, { list });
    }

    getListSubtext(items: Item[] = []) {
        return items.length + " item" + (items.length == 1 ? "" : "s");
    };

    async handleAddListClick() {
        const addListAlert = this.alertCtrl.create({
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
                        const addListPromise = this.listService.addListForUser(this.store.getUser(), newList.name);
                        return this.nav.push(ListPage, { list: newList, addListPromise });
                    }
                }],
        });

        return addListAlert.present();
    }

    // update lists locally, then on firestore
    async handleDeleteClick(e, listToRemove) {
        const deleteConfirm = this.alertCtrl.create({
            title: 'Remove yourself from this list?',
            buttons: [
                'Cancel',
                {
                    text: 'Remove me',
                    handler: () => this.removeList(listToRemove)
                }],
        });

        await deleteConfirm.present();

        e.stopPropagation(); // don't trigger click on surrounding card
    }

    async removeList(listToRemove) {
        this.isLoading = true;
        this.lists = this.lists.filter(list => list.id != listToRemove.id);
        return this.listService.removeListForCurrentUser(this.store.getUser(), listToRemove)
            .then(() => this.loadLists())
            .catch(error => {
                console.error(error);
                this.lists.push(listToRemove);
                this.isLoading = false;
            });
    }

    async handleDashboardRefresh(e) {
        this.loadLists()
            .then(() => e.complete());
    }

    async handleListImageClick(e, list: List) {
        console.log("uploading pictures");

        const options: CameraOptions = {
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE
        };

        e.stopPropagation(); // don't trigger click on surrounding card
        // Handle error
        return this.camera.getPicture(options)
            .then(imageData => {

                const imageId = uuid();
                this.fileService.uploadImage(imageId, "data:image/jpeg;base64," + imageData)
                    .then(() => this.listService.updateList({ imageId, ...list }));
            })
            .catch(err => {
                console.error("Error uploading image.", err);
            });
    }

    async handleLongPress(listToEdit: List) {
        return this.displayManagePage(listToEdit);
    }

    private displayManagePage(list: List): Promise<any> {
        return this.nav.push(ManageListPage, { knownUserEmails: this.store.getUser().knownUserEmails, list });
    }
}
