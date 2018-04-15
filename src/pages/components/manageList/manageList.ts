import { Component } from "@angular/core";
import { ViewController, NavParams } from "ionic-angular";
import _ from "lodash";
import { List } from "models/list";
import { DocumentReference } from "@firebase/firestore-types";
import { SiteStore } from "services/siteStore";
import { FirestoreListService } from "services/firestoreListService";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({ selector: 'page-managelist', templateUrl: 'manageList.html' })
export class ManageListPage {    
    addEmailForm: FormGroup;
    knownUserEmails: string[];
    existingEmails: string[] = [];
    modifiedList: string[] = [];
    searchResults: string[] = [];
    isLoading: boolean = true;
    list: List;

    hasChanged() {
        return _.some(_.difference(this.modifiedList, this.existingEmails).concat(_.difference(this.existingEmails, this.modifiedList)));
    }

    constructor(public viewCtrl: ViewController, params: NavParams, private formBuilder: FormBuilder, private store: SiteStore, private listService: FirestoreListService) {
        this.addEmailForm = formBuilder.group({
            email: ['', Validators.compose([Validators.required, Validators.email])]
        });

        this.knownUserEmails = params.get("knownUserEmails") || [];
        this.list = params.get("list");

        ManageListPage.fetchUserEmails(this.list.userIds).then((emails: string[]) => {
            if (!emails) return;

            console.log("users in list", emails);

            this.modifiedList = _.uniq(this.modifiedList.concat([...emails]));
            this.existingEmails = [...emails];
            this.isLoading = false;
        });
    }

    private static fetchUserEmails(userRefs: DocumentReference[]): Promise<string[]> {
        return Promise.all(userRefs.map(userRef => userRef.get().then(documentSnapshot => {
            const userData = documentSnapshot.data();
            return userData.email;
        })));
    }

    private addEmail() {
        if (this.addEmailForm.valid) {
            this.modifiedList.push(this.addEmailForm.value.email.toLowerCase());
            this.clearForm();
        }
    }

    private search(value: string) {
        if (!value) {
            this.searchResults = [];
            return;
        }

        this.searchResults = this.knownUserEmails
            .filter(email => email.indexOf(value.toLowerCase()) >= 0) // include known
            .filter(email => this.modifiedList.indexOf(email) < 0); // exclude if already in modified list
    }

    private clearForm() {
        this.addEmailForm.value.email = "";
        this.searchResults = [];
    }

    private handleMatchingEmailClick(email: string) {
        this.clearForm();

        if (this.modifiedList.indexOf(email) >= 0) return;

        this.modifiedList.push(email);
    }

    private handleRemoveUserClick(emailToRemove: string) {
        this.modifiedList = this.modifiedList.filter(email => email !== emailToRemove)
    }

    private removeEmailsFromList(): Promise<void> {
        const emailsToRemove = _.difference(this.existingEmails, this.modifiedList);

        if (_.some(emailsToRemove))
            return this.listService.removeListForUsers(this.list, emailsToRemove).then(() => console.log("done removing", emailsToRemove));

        return Promise.resolve();
    }

    private addEmailsToList(): Promise<void> {
        const emailsToAdd = _.difference(this.modifiedList, this.existingEmails);

        if (_.some(emailsToAdd))
            return this.listService.addUsersToList(this.list, this.store.getUser(), emailsToAdd).then(() => console.log("done adding", emailsToAdd)).catch(error => console.log("error adding", error));

        return Promise.resolve();
    }

    save() {
        const savingListPromise = Promise.all([this.addEmailsToList(), this.removeEmailsFromList()]).then(() => console.log("adding and removing done"));

        this.viewCtrl.dismiss({ savingListPromise });
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}
